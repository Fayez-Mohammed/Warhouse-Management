Categories


GET
/api/Categories/GetAllCategories
جلب حميع الاصناف


Parameters
Cancel
Name	Description
skip
integer($int32)
(query)
0
take
integer($int32)
(query)
10
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://warhouse-management.runasp.net/api/Categories/GetAllCategories?skip=0&take=10' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJqdGkiOiI4YTkxY2QyMi04OWE0LTQxZDctYWJmZi05OGE0ZTllZTU3YzMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBnbWFpbC5jb20iLCJVc2VyVHlwZSI6IlN5c3RlbUFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3lzdGVtQWRtaW4iLCJleHAiOjE3ODQ1Njg5MDAsImlzcyI6IkF1dGhBcGlTUUwiLCJhdWQiOiJBdXRoQXBpVXNlcnMifQ.4o_vG5elWCHS13z6vIpD8neJJPNYAE-rAQKgp7JaZG4'
Request URL
https://warhouse-management.runasp.net/api/Categories/GetAllCategories?skip=0&take=10
Server response
Code	Details
200	
Response body
Download
{
  "statusCode": 200,
  "message": "Success",
  "traceId": "40005daf-0002-5500-b63f-84710c7967bb",
  "value": [
    {
      "id": "3a907ebd-0f1f-4b25-bc83-3854f9e28ebc",
      "code": 2,
      "name": "general",
      "description": "for every thing",
      "dateofcreation": "2026-06-09T09:30:10.0467842"
    },
    {
      "id": "36bec70a-4cca-40ba-9e2c-cf1d3847728c",
      "code": 4,
      "name": "modern cars",
      "description": "modern cars",
      "dateofcreation": "2026-06-09T11:16:12.9011042"
    },
    {
      "id": "675635e1-7737-4acd-96fe-248ecf188112",
      "code": 8,
      "name": "new cat",
      "description": "new category ",
      "dateofcreation": "2026-07-13T17:55:18.594535"
    },
    {
      "id": "83fb180f-50ab-416e-9d40-5578f1107065",
      "code": 1,
      "name": "عام",
      "description": null,
      "dateofcreation": "2026-02-03T18:26:01.9291178"
    }
  ]
}
Response headers
 content-encoding: br 
 content-type: application/json; charset=utf-8 
 date: Mon,13 Jul 2026 17:56:16 GMT 
 server: Microsoft-IIS/10.0 
 vary: Accept-Encoding 
 x-powered-by: ASP.NET 
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Categories/GetCategoryByName
جلب تفاصيل فئة معينة بناءً على اسمها


Parameters
Cancel
Name	Description
name
string
(query)
اسم الفئة المراد عرض تفاصيلها

عام
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://warhouse-management.runasp.net/api/Categories/GetCategoryByName?name=%D8%B9%D8%A7%D9%85' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJqdGkiOiI4YTkxY2QyMi04OWE0LTQxZDctYWJmZi05OGE0ZTllZTU3YzMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBnbWFpbC5jb20iLCJVc2VyVHlwZSI6IlN5c3RlbUFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3lzdGVtQWRtaW4iLCJleHAiOjE3ODQ1Njg5MDAsImlzcyI6IkF1dGhBcGlTUUwiLCJhdWQiOiJBdXRoQXBpVXNlcnMifQ.4o_vG5elWCHS13z6vIpD8neJJPNYAE-rAQKgp7JaZG4'
Request URL
https://warhouse-management.runasp.net/api/Categories/GetCategoryByName?name=%D8%B9%D8%A7%D9%85
Server response
Code	Details
200	
Response body
Download
{
  "statusCode": 200,
  "message": "Success",
  "traceId": "4000527b-0000-0d00-b63f-84710c7967bb",
  "id": "83fb180f-50ab-416e-9d40-5578f1107065",
  "code": 1,
  "name": "عام",
  "description": null,
  "dateofcreation": "2026-02-03T18:26:01.9291178"
}
Response headers
 content-encoding: br 
 content-type: application/json; charset=utf-8 
 date: Mon,13 Jul 2026 17:56:27 GMT 
 server: Microsoft-IIS/10.0 
 vary: Accept-Encoding 
 x-powered-by: ASP.NET 
Responses
Code	Description	Links
200	
OK

No links

POST
/api/Categories/CreateCategory


Parameters
Cancel
Reset
No parameters

Request body

application/json
{
  "name": "Big products",
  "description": "for Big Products "
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://warhouse-management.runasp.net/api/Categories/CreateCategory' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJqdGkiOiI4YTkxY2QyMi04OWE0LTQxZDctYWJmZi05OGE0ZTllZTU3YzMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBnbWFpbC5jb20iLCJVc2VyVHlwZSI6IlN5c3RlbUFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3lzdGVtQWRtaW4iLCJleHAiOjE3ODQ1Njg5MDAsImlzcyI6IkF1dGhBcGlTUUwiLCJhdWQiOiJBdXRoQXBpVXNlcnMifQ.4o_vG5elWCHS13z6vIpD8neJJPNYAE-rAQKgp7JaZG4' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Big products",
  "description": "for Big Products "
}'
Request URL
https://warhouse-management.runasp.net/api/Categories/CreateCategory
Server response
Code	Details
200	
Response body
Download
{
  "statusCode": 200,
  "message": "تم إنشاء الفئة بنجاح",
  "traceId": "40002c7b-0004-ab00-b63f-84710c7967bb",
  "categoryid": "c8a8b521-6d06-44f6-a91d-af3e1e75d169"
}
Response headers
 content-encoding: br 
 content-type: application/json; charset=utf-8 
 date: Mon,13 Jul 2026 17:57:08 GMT 
 server: Microsoft-IIS/10.0 
 vary: Accept-Encoding 
 x-powered-by: ASP.NET 
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/Categories/UpdateCategory
تحديث تفاصيل فئة معينة


Parameters
Cancel
Reset
No parameters

Request body

application/json
بيانات الفئة المحدثة التي تشمل معرف الفئة، الاسم، الوصف، وأي معلومات أخرى ذات صلة

{
  "id": "c8a8b521-6d06-44f6-a91d-af3e1e75d169",
  "name": "Smal Category",
  "description": "for small products"
}
Execute
Clear
Responses
Curl

curl -X 'PUT' \
  'https://warhouse-management.runasp.net/api/Categories/UpdateCategory' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJqdGkiOiI4YTkxY2QyMi04OWE0LTQxZDctYWJmZi05OGE0ZTllZTU3YzMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBnbWFpbC5jb20iLCJVc2VyVHlwZSI6IlN5c3RlbUFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3lzdGVtQWRtaW4iLCJleHAiOjE3ODQ1Njg5MDAsImlzcyI6IkF1dGhBcGlTUUwiLCJhdWQiOiJBdXRoQXBpVXNlcnMifQ.4o_vG5elWCHS13z6vIpD8neJJPNYAE-rAQKgp7JaZG4' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "c8a8b521-6d06-44f6-a91d-af3e1e75d169",
  "name": "Smal Category",
  "description": "for small products"
}'
Request URL
https://warhouse-management.runasp.net/api/Categories/UpdateCategory
Server response
Code	Details
200	
Response body
Download
{
  "statusCode": 200,
  "message": "تم تحديث الفئة بنجاح",
  "traceId": "40003bc5-0800-a400-b63f-84710c7967bb"
}
Response headers
 content-encoding: br 
 content-type: application/json; charset=utf-8 
 date: Mon,13 Jul 2026 17:57:43 GMT 
 server: Microsoft-IIS/10.0 
 vary: Accept-Encoding 
 x-powered-by: ASP.NET 
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/Categories/DeleteCategory
حذف فئة معينة بناءً على معرفها


Parameters
Cancel
Name	Description
id
string
(query)
معرف الفئة المراد حذفها

c8a8b521-6d06-44f6-a91d-af3e1e75d169
Execute
Clear
Responses
Curl

curl -X 'DELETE' \
  'https://warhouse-management.runasp.net/api/Categories/DeleteCategory?id=c8a8b521-6d06-44f6-a91d-af3e1e75d169' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJqdGkiOiI4YTkxY2QyMi04OWE0LTQxZDctYWJmZi05OGE0ZTllZTU3YzMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBnbWFpbC5jb20iLCJVc2VyVHlwZSI6IlN5c3RlbUFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3lzdGVtQWRtaW4iLCJleHAiOjE3ODQ1Njg5MDAsImlzcyI6IkF1dGhBcGlTUUwiLCJhdWQiOiJBdXRoQXBpVXNlcnMifQ.4o_vG5elWCHS13z6vIpD8neJJPNYAE-rAQKgp7JaZG4'
Request URL
https://warhouse-management.runasp.net/api/Categories/DeleteCategory?id=c8a8b521-6d06-44f6-a91d-af3e1e75d169
Server response
Code	Details
200	
Response body
Download
{
  "statusCode": 200,
  "message": "تم حذف الفئة بنجاح",
  "traceId": "40000d15-0004-fe00-b63f-84710c7967bb"
}
Response headers
 content-encoding: br 
 content-type: application/json; charset=utf-8 
 date: Mon,13 Jul 2026 17:58:00 GMT 
 server: Microsoft-IIS/10.0 
 vary: Accept-Encoding 
 x-powered-by: ASP.NET 
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Categories/autocomplete
الحصول على اقتراحات الفئات بناءً على مصطلح البحث


Parameters
Cancel
Name	Description
term
string
(query)
مصطلح البحث المستخدم للحصول على اقتراحات الفئات

ع
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://warhouse-management.runasp.net/api/Categories/autocomplete?term=%D8%B9' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJiMDM3Yzc3MC05MGFlLTRkMmQtOWU4OS1jMTk4YjdmNGUxNjYiLCJqdGkiOiI4YTkxY2QyMi04OWE0LTQxZDctYWJmZi05OGE0ZTllZTU3YzMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBnbWFpbC5jb20iLCJVc2VyVHlwZSI6IlN5c3RlbUFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3lzdGVtQWRtaW4iLCJleHAiOjE3ODQ1Njg5MDAsImlzcyI6IkF1dGhBcGlTUUwiLCJhdWQiOiJBdXRoQXBpVXNlcnMifQ.4o_vG5elWCHS13z6vIpD8neJJPNYAE-rAQKgp7JaZG4'
Request URL
https://warhouse-management.runasp.net/api/Categories/autocomplete?term=%D8%B9
Server response
Code	Details
200	
Response body
Download
{
  "statusCode": 200,
  "message": "Success",
  "traceId": "40000d1b-0004-fe00-b63f-84710c7967bb",
  "value": [
    {
      "id": "83fb180f-50ab-416e-9d40-5578f1107065",
      "code": 1,
      "name": "عام"
    }
  ]
}