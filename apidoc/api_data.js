define({ "api": [
  {
    "type": "get",
    "url": "/course",
    "title": "Get courses in a subject",
    "name": "GetCourses",
    "group": "Class",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "year",
            "description": "<p>The school year</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "semester",
            "description": "<p>The specific semester</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "course",
            "description": "<p>The course abbreviation</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "course",
            "description": "<p>The subject course</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Course ID</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n      \"course\": \"Intro Asian American Studies\",\n      \"id\": \"100\"\n    },\n    {\n      \"course\": \"U.S. Race and Empire\",\n      \"id\": \"200\"\n    },\n    {\n      \"course\": \"US Racial & Ethnic Politics\",\n      \"id\": \"201\"\n    }\n]",
          "type": "Object[]"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": \"Could not make request to the course website\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/api.js",
    "groupTitle": "Class"
  },
  {
    "type": "get",
    "url": "/sectionDetails",
    "title": "Get section details",
    "name": "GetSectionDetails",
    "group": "Class",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "year",
            "description": "<p>The school year</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "semester",
            "description": "<p>The specific semester</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "course",
            "description": "<p>The course abbreviation</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "courseId",
            "description": "<p>The specific course ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sectionId",
            "description": "<p>The specific section ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "sectionId",
            "description": "<p>The section ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "sectionNumber",
            "description": "<p>The section number</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "enrollmentStatus",
            "description": "<p>Enrollment Status</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Section Type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "startTime",
            "description": "<p>Section Start Time</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "endTime",
            "description": "<p>Section End Time</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "daysOfWeek",
            "description": "<p>The days the classes occur</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"sectionId\": \"30107\",\n  \"sectionNumber\": \"AD1\",\n  \"enrollmentStatus\": \"Open\",\n  \"type\": \"DIS\",\n  \"startTime\": \"09:00 AM\",\n  \"endTime\": \"09:50 AM\",\n  \"daysOfWeek\": \"F      \"\n}",
          "type": "Object[]"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": \"Could not make request to the course website\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/api.js",
    "groupTitle": "Class"
  },
  {
    "type": "get",
    "url": "/section",
    "title": "Get sections in a specific course",
    "name": "GetSections",
    "group": "Class",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "year",
            "description": "<p>The school year</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "semester",
            "description": "<p>The specific semester</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "course",
            "description": "<p>The course abbreviation</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "courseId",
            "description": "<p>The specific course ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "section",
            "description": "<p>The sections in a course</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>section ID</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n      \"section\": \"AD1\"\n      \"id\": \"30107\"\n    },\n    {\n      \"section\": \"AD2\",\n      \"id\": \"41729\"\n    },\n    {\n      \"section\": \"AD3\",\n      \"id\": \"43832\"\n    },\n    {\n      \"section\": \"AD4\",\n      \"id\": \"48232\"\n    }\n]",
          "type": "Object[]"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": \"Could not make request to the course website\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/api.js",
    "groupTitle": "Class"
  },
  {
    "type": "get",
    "url": "/semester",
    "title": "Get semesters for year",
    "name": "GetSemester",
    "group": "Class",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "year",
            "description": "<p>The specific school year</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  \"Spring\",\n  \"Summer\",\n  \"Fall\",\n  \"Winter\"\n]",
          "type": "String[]"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": \"Could not make request to the course website\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/api.js",
    "groupTitle": "Class"
  },
  {
    "type": "get",
    "url": "/subject",
    "title": "Get all subjects",
    "name": "GetSubjects",
    "group": "Class",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "year",
            "description": "<p>The school year</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "semester",
            "description": "<p>The specific semester</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "subject",
            "description": "<p>The school subject</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Subject ID</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n      \"subject\": \"Asian American Studies\",\n      \"id\": \"AAS\"\n    },\n    {\n      \"subject\": \"Agricultural and Biological Engineering\",\n      \"id\": \"ABE\"\n    },\n    {\n      \"subject\": \"Accountancy\",\n      \"id\": \"ACCY\"\n    }\n]",
          "type": "Object[]"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": \"Could not make request to the course website\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/api.js",
    "groupTitle": "Class"
  },
  {
    "type": "get",
    "url": "/years",
    "title": "Get all years",
    "name": "GetYears",
    "group": "Class",
    "version": "0.1.0",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  \"2018\",\n  \"2017\",\n  \"2016\",\n  \"2015\",\n  \"2014\"\n]",
          "type": "String[]"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": \"Could not make request to the course website\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/api.js",
    "groupTitle": "Class"
  }
] });
