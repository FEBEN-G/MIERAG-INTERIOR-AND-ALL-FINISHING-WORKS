export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "MIERAG INTERIOR AND ALL FINISHING WORKS API",
    version: "1.0.0",
    description:
      "Sites, skills, worker applications, and admin review for the MIERAG recruitment platform. Admin routes use the httpOnly cookie set by login.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Health", description: "Service status" },
    { name: "Sites", description: "Public project listings" },
    { name: "Skills", description: "Active skill categories" },
    { name: "Posts", description: "Public work posts" },
    { name: "Inquiries", description: "Visitor messages" },
    { name: "Applications", description: "Public worker applications" },
    { name: "Admin", description: "Protected review tools" },
  ],
  components: {
    securitySchemes: {
      adminCookie: {
        type: "apiKey",
        in: "cookie",
        name: "mierag_admin",
        description: "Set by POST /api/admin/auth/login. Call login from this page first, then call the protected routes.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["message"],
            properties: {
              message: { type: "string" },
              fields: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          },
        },
      },
      SiteStatus: {
        type: "string",
        enum: ["STRUCTURAL_WORK", "ROUGH_IN", "FINAL_FINISHING", "COMPLETED"],
      },
      ApplicationStatus: {
        type: "string",
        enum: ["PENDING", "REVIEWED", "SHORTLISTED", "CONTACTED", "ACCEPTED", "REJECTED"],
      },
      Skill: {
        type: "object",
        required: ["id", "name", "slug"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          slug: { type: "string" },
        },
      },
      RequiredSkill: {
        allOf: [
          { $ref: "#/components/schemas/Skill" },
          {
            type: "object",
            properties: {
              workersNeeded: { type: "integer", nullable: true },
            },
          },
        ],
      },
      Site: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/SiteStatus" },
          address: { type: "string" },
          latitude: { type: "number", nullable: true },
          longitude: { type: "number", nullable: true },
          estimatedDuration: { type: "string" },
          startDate: { type: "string", format: "date-time", nullable: true },
          expectedCompletionDate: { type: "string", format: "date-time", nullable: true },
          currentWorkerCount: { type: "integer" },
          coverImageUrl: { type: "string" },
          compensationMin: { type: "integer", nullable: true },
          compensationMax: { type: "integer", nullable: true },
          compensationNote: { type: "string", nullable: true },
          isPreview: { type: "boolean" },
          isRecruiting: { type: "boolean" },
          requiredSkills: {
            type: "array",
            items: { $ref: "#/components/schemas/RequiredSkill" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SiteList: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Site" } },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              page: { type: "integer" },
              pageSize: { type: "integer" },
              source: { type: "string", example: "api" },
            },
          },
          stats: {
            type: "object",
            properties: {
              total: { type: "integer" },
              active: { type: "integer" },
              completed: { type: "integer" },
              recruiting: { type: "integer" },
            },
          },
        },
      },
      ApplicationCreated: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              status: { $ref: "#/components/schemas/ApplicationStatus" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      ApplicationInput: {
        type: "object",
        required: ["siteId", "fullName", "phoneNumber", "skillCategoryId", "expectedRate", "experienceYears"],
        properties: {
          siteId: { type: "string", format: "uuid" },
          fullName: { type: "string", minLength: 2, maxLength: 100 },
          phoneNumber: { type: "string", example: "+251911234567" },
          skillCategoryId: { type: "string", format: "uuid" },
          expectedRate: { type: "integer", minimum: 0, description: "Expected daily rate in ETB" },
          experienceYears: { type: "integer", minimum: 0, maximum: 50 },
          experienceDetails: { type: "string", maxLength: 2000 },
        },
      },
      AdminSession: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
              role: { type: "string", example: "ADMIN" },
            },
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      AdminApplication: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          siteId: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          phoneNumber: { type: "string" },
          skillCategoryId: { type: "string", format: "uuid" },
          expectedRate: { type: "integer" },
          experienceYears: { type: "integer" },
          experienceDetails: { type: "string", nullable: true },
          status: { $ref: "#/components/schemas/ApplicationStatus" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          site: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              address: { type: "string" },
              status: { $ref: "#/components/schemas/SiteStatus" },
            },
          },
          skill: { $ref: "#/components/schemas/Skill" },
        },
      },
      StatusUpdate: {
        type: "object",
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/ApplicationStatus" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API and database",
        responses: {
          "200": {
            description: "Database responded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
          "503": {
            description: "Database is unreachable",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/sites": {
      get: {
        tags: ["Sites"],
        summary: "List projects",
        parameters: [
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/SiteStatus" } },
          { name: "skill", in: "query", schema: { type: "string" }, description: "Skill slug" },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "minRate", in: "query", schema: { type: "integer", minimum: 0 } },
          { name: "maxRate", in: "query", schema: { type: "integer", minimum: 0 } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 12 } },
        ],
        responses: {
          "200": {
            description: "Project page",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SiteList" } } },
          },
          "400": {
            description: "Invalid query",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/sites/{siteId}": {
      get: {
        tags: ["Sites"],
        summary: "Get one project",
        parameters: [
          { name: "siteId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Project",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Site" } },
                },
              },
            },
          },
          "404": {
            description: "Project not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/skills": {
      get: {
        tags: ["Skills"],
        summary: "List active skills",
        responses: {
          "200": {
            description: "Skill list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Skill" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/posts": {
      get: {
        tags: ["Posts"],
        summary: "Published work posts",
        responses: {
          "200": { description: "Posts shown on the public gallery and homepage" },
        },
      },
    },
    "/api/inquiries": {
      post: {
        tags: ["Inquiries"],
        summary: "Send a website message",
        description: "Saves the message, adds an admin notice, and emails the studio when SMTP is configured.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "message"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Message saved" },
          "400": { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Too many messages" },
        },
      },
    },
    "/api/admin/notices": {
      get: {
        tags: ["Admin"],
        summary: "List message and application notices",
        security: [{ adminCookie: [] }],
        responses: { "200": { description: "Notices" }, "401": { description: "Authentication required" } },
      },
    },
    "/api/admin/notices/{noticeId}": {
      patch: {
        tags: ["Admin"],
        summary: "Mark a notice read or unread",
        security: [{ adminCookie: [] }],
        parameters: [{ name: "noticeId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Updated notice" }, "401": { description: "Authentication required" } },
      },
    },
    "/api/admin/posts": {
      get: {
        tags: ["Admin"],
        summary: "List every work post",
        security: [{ adminCookie: [] }],
        responses: { "200": { description: "Posts, including hidden ones" }, "401": { description: "Authentication required" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a work post",
        security: [{ adminCookie: [] }],
        responses: { "201": { description: "Post created" }, "401": { description: "Authentication required" } },
      },
    },
    "/api/admin/posts/{postId}": {
      patch: {
        tags: ["Admin"],
        summary: "Edit a work post",
        security: [{ adminCookie: [] }],
        parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Updated post" }, "401": { description: "Authentication required" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Remove a work post",
        security: [{ adminCookie: [] }],
        parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "204": { description: "Removed" }, "401": { description: "Authentication required" } },
      },
    },
    "/api/admin/sites": {
      post: {
        tags: ["Admin"],
        summary: "Create a project",
        security: [{ adminCookie: [] }],
        responses: { "201": { description: "Project created" }, "401": { description: "Authentication required" } },
      },
    },
    "/api/admin/sites/{siteId}": {
      patch: {
        tags: ["Admin"],
        summary: "Edit a project",
        security: [{ adminCookie: [] }],
        parameters: [{ name: "siteId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Updated project" }, "401": { description: "Authentication required" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Remove a project",
        security: [{ adminCookie: [] }],
        parameters: [{ name: "siteId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "204": { description: "Removed" }, "401": { description: "Authentication required" } },
      },
    },
    "/api/applications": {
      post: {
        tags: ["Applications"],
        summary: "Submit a worker application",
        description:
          "Saves the application first. Email is attempted afterward and does not erase the saved row. Limited to 5 submissions per IP each hour. The same phone cannot apply to the same project twice within 24 hours. Completed projects reject applications.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApplicationInput" } } },
        },
        responses: {
          "201": {
            description: "Application saved",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApplicationCreated" } } },
          },
          "400": {
            description: "Validation failed, unknown project, inactive skill, or completed project",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "409": {
            description: "Duplicate phone for this project within 24 hours",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "429": {
            description: "Application rate limit",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/admin/auth/login": {
      post: {
        tags: ["Admin"],
        summary: "Sign in",
        description: "Sets the mierag_admin cookie. Limited to 10 attempts every 15 minutes.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
        },
        responses: {
          "200": {
            description: "Signed in",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AdminSession" } } },
          },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": {
            description: "Invalid email or password",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "429": {
            description: "Login rate limit",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/admin/auth/logout": {
      post: {
        tags: ["Admin"],
        summary: "Sign out",
        responses: {
          "200": {
            description: "Cookie cleared",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { type: "object", properties: { ok: { type: "boolean" } } } },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/me": {
      get: {
        tags: ["Admin"],
        summary: "Current admin",
        security: [{ adminCookie: [] }],
        responses: {
          "200": {
            description: "Signed-in admin",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AdminSession" } } },
          },
          "401": {
            description: "Authentication required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/admin/applications": {
      get: {
        tags: ["Admin"],
        summary: "List applications",
        security: [{ adminCookie: [] }],
        parameters: [
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/ApplicationStatus" } },
          { name: "siteId", in: "query", schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Applications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/AdminApplication" } },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid query",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": {
            description: "Authentication required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/admin/applications/{applicationId}": {
      get: {
        tags: ["Admin"],
        summary: "Get one application",
        security: [{ adminCookie: [] }],
        parameters: [
          { name: "applicationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Application",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/AdminApplication" } },
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "404": {
            description: "Application not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/admin/applications/{applicationId}/status": {
      patch: {
        tags: ["Admin"],
        summary: "Update application status",
        security: [{ adminCookie: [] }],
        parameters: [
          { name: "applicationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StatusUpdate" } } },
        },
        responses: {
          "200": {
            description: "Updated application",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/AdminApplication" } },
                },
              },
            },
          },
          "400": {
            description: "Invalid status",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": {
            description: "Authentication required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "404": {
            description: "Application not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
};
