#!/bin/sh
# Read-only check of a running site. Safe to run on the live server:
#   ./deploy/smoke-test.sh https://your-domain
set -u

base="${1:?Usage: deploy/smoke-test.sh https://your-domain}"
failed=0

status() { curl -k -s -o /dev/null -w '%{http_code}' -m 20 "$base$1"; }

expect() {
  actual="$(status "$1")"
  if [ "$actual" = "$2" ]; then
    echo "ok    $1 ($actual)"
  else
    echo "FAIL  $1: expected $2, got $actual"
    failed=1
  fi
}

expect_header() {
  if curl -k -s -I -m 20 "$base/" | grep -qi "^$1:"; then
    echo "ok    header $1"
  else
    echo "FAIL  header $1 is missing"
    failed=1
  fi
}

expect /api/health 200
expect / 200
expect /gallery 200
expect /projects 200
expect /admin/login 200
expect /robots.txt 200
expect /sitemap.xml 200
expect /api/settings 200
expect /api/sites 200
expect /api/skills 200
expect /api/posts 200
expect /a-page-that-does-not-exist 404
expect /api/a-route-that-does-not-exist 404
expect /api/admin/me 401

expect_header strict-transport-security
expect_header x-content-type-options
expect_header referrer-policy
expect_header content-security-policy

if [ "$failed" -ne 0 ]; then
  echo "Smoke test FAILED"
  exit 1
fi
echo "Smoke test passed"
