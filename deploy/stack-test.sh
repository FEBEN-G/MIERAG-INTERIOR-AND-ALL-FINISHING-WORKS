#!/bin/bash
# Full end-to-end test of a running stack. It CREATES AND DELETES test data, so use it
# only on a test environment, never on the live site. CI runs it on every push.
#   ADMIN_EMAIL=… ADMIN_PASSWORD=… ./deploy/stack-test.sh https://localhost
set -u

base="${1:?Usage: deploy/stack-test.sh https://localhost}"
photo="frontend/public/assets/preview/tile.jpg"
jar="$(mktemp)"
failed=0

api() { curl -k -s -m 30 -b "$jar" -c "$jar" "$@"; }
pass() { echo "ok    $1"; }
fail() { echo "FAIL  $1"; failed=1; }
check() { if [ "$2" = "$3" ]; then pass "$1"; else fail "$1: expected $3, got $2"; fi; }
json() { api -H 'Content-Type: application/json' "$@"; }

code=$(json -o /dev/null -w '%{http_code}' -X POST "$base/api/admin/auth/login" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
check "admin login" "$code" 200
check "session is active" "$(api -o /dev/null -w '%{http_code}' "$base/api/admin/me")" 200

# Upload: a real photo goes through resizing and comes back at its new address.
before=$(wc -c < "$photo")
url=$(api -X POST -H 'Content-Type: image/jpeg' --data-binary "@$photo" "$base/api/admin/uploads" | jq -r '.data.url')
case "$url" in
  /api/uploads/*.jpg) pass "photo upload" ;;
  *) fail "photo upload returned '$url'" ;;
esac
check "uploaded photo is served" "$(api -o /dev/null -w '%{http_code}' "$base$url")" 200
after=$(api "$base$url" | wc -c)
if [ "$after" -gt 1000 ]; then pass "uploaded photo has content ($before -> $after bytes)"; else fail "uploaded photo is empty"; fi
fake=$(printf '<svg xmlns="http://www.w3.org/2000/svg"/>' | api -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: image/png' --data-binary @- "$base/api/admin/uploads")
check "fake image refused" "$fake" 415

# Settings reach the public API.
json -o /dev/null -X PATCH "$base/api/admin/settings" -d "{\"images\":{\"hero\":\"$url\"}}"
check "site image saved" "$(api "$base/api/settings" | jq -r '.data.images.hero')" "$url"
json -o /dev/null -X PATCH "$base/api/admin/settings" -d '{"images":{"hero":null}}'

# Simultaneous identical applications, on real Postgres with many connections.
site=$(api "$base/api/sites" | jq -r '[.data[] | select(.isRecruiting)][0].id')
skill=$(api "$base/api/skills" | jq -r '.data[0].id')
body="{\"siteId\":\"$site\",\"fullName\":\"Stack Test\",\"phoneNumber\":\"0922334455\",\"skillCategoryId\":\"$skill\",\"expectedRate\":300,\"experienceYears\":2}"
codes=$(for _ in 1 2 3 4 5 6 7 8; do
  curl -k -s -o /dev/null -w "%{http_code}
" -m 30 -H "Content-Type: application/json" -d "$body" "$base/api/applications" &
done)
wait
check "eight applications at once: one saved" "$(echo "$codes" | grep -c 201)" 1
check "eight applications at once: seven refused" "$(echo "$codes" | grep -c 409)" 7
rows=$(api "$base/api/admin/applications" | jq '[.data[] | select(.fullName == "Stack Test")] | length')
check "exactly one application row" "$rows" 1
id=$(api "$base/api/admin/applications" | jq -r '[.data[] | select(.fullName == "Stack Test")][0].id')
notices=$(api "$base/api/admin/notices" | jq '[.data[] | select(.body | contains("Stack Test"))] | length')
check "exactly one notice" "$notices" 1
check "delete application" "$(api -o /dev/null -w '%{http_code}' -X DELETE "$base/api/admin/applications/$id")" 204
notices=$(api "$base/api/admin/notices" | jq '[.data[] | select(.body | contains("Stack Test"))] | length')
check "the person's details are gone from notices" "$notices" 0

echo "UPLOADED_URL=$url"
rm -f "$jar"
if [ "$failed" -ne 0 ]; then
  echo "Stack test FAILED"
  exit 1
fi
echo "Stack test passed"
