Population có thể tự động tạo đường dẫn với các document với nhau. Nó có liên kết 1 document, nhiều document, các đối tượng (object) đơn giản, các đối tượng lồng nhau hoặc là trả tất cả các đối tượng trong 1 lần truy vấn

AUTHENTICATION : SO sánh pass của user so với info trên db, so sánh dữ liệu nhập vs db đã có
AUTHORIZATION: bạn là ai và bạn có quyền làm gi (phần quyền)

## user và store

trong đó một người dùng có thể có nhiều cửa hàng user và store

## user và order

user có nhiều order

## product và store

trong đó nhiều sản phẩm có thể thuộc về nhiều cửa hàng và mỗi cửa hàng có thể có nhiều sản phẩm.

## product và category

1 danh mục có nhiều sản phẩm

// create order: "shippingInfo": {
"address": "address 2",
"city": "city",
"country": "country",
"zipCode": 7.572e+29,
"phone": 5464646
},
"orderItems": [
{
"price": 23,
"quantity": 3,
"product": "63e5b7ed84a2e1de87071a47",
"_id": "63e8f9845b3f06b704e6eecd"
}
],
"user": "63df7aadcd14e175557767cb",
"paymentInfo": {
"id": "dkjjd894",
"status": "paid"
},
"itemsPrice": 150,
"taxPrice": 3,
"shippingPrice": 21,
"totalPrice": 77,
