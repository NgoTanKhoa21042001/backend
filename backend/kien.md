Population có thể tự động tạo đường dẫn với các document với nhau. Nó có liên kết 1 document, nhiều document, các đối tượng (object) đơn giản, các đối tượng lồng nhau hoặc là trả tất cả các đối tượng trong 1 lần truy vấn

AUTHENTICATION : SO sánh pass của user so với info trên db, so sánh dữ liệu nhập vs db đã có
AUTHORIZATION: bạn là ai và bạn có quyền làm gi (phần quyền)

## seller và store

1 store có nhiều seller

## user và order

user có nhiều order

## product và store

trong đó nhiều sản phẩm có thể thuộc về nhiều cửa hàng và mỗi cửa hàng có thể có nhiều sản phẩm.

## product và category, brand

1 danh mục có nhiều sản phẩm

## product và order

order nhiều product

# store dùng để lưu trữ những products và users mà store đó bán và thông tin user. Là người dùng mua product đó ở cửa hàng nào và store sẽ lấy info người dùng

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
=================================================

let newRefreshTokenArray = !cookies?.jwt ? user.refreshToken : user.refreshToken.filter((rt) => rt !== cookies.jwt);: tạo biến newRefreshTokenArray với giá trị ban đầu là mảng user.refreshToken. Nếu không có cookie JWT nào được tìm thấy trong request, nó sẽ được sử dụng làm Refresh Token mới nhất. Nếu cookie JWT được tìm thấy, nó sẽ được loại bỏ khỏi mảng Refresh Token.

if (cookies?.jwt) {: kiểm tra xem có cookie JWT được tìm thấy trong request hay không.

const refreshToken = cookies.jwt;: gán giá trị của cookie JWT cho biến refreshToken.

const foundToken = await User.findOne({ refreshToken }).exec();: tìm kiếm trong cơ sở dữ liệu xem Refresh Token đã được sử dụng trước đó hay chưa bằng cách tìm kiếm một user có Refresh Token trùng với giá trị của biến refreshToken.

if (!foundToken) {: nếu không tìm thấy user nào có Refresh Token trùng với giá trị của biến refreshToken, tức là Refresh Token này chưa được sử dụng trước đó, nó sẽ báo lỗi và xóa toàn bộ mảng Refresh Token.

res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });: xóa cookie JWT khỏi trình duyệt của người dùng. Chỉ có thể thực hiện được khi có response được gửi trả về cho client.

Tóm lại, đoạn mã trên có chức năng để đảm bảo rằng mỗi Refresh Token chỉ được sử dụng một lần để tăng cường tính bảo mật của ứng dụng. Nếu Refresh Token đã được sử dụng trước đó thì nó sẽ không còn hợp lệ và không thể sử dụng lại được. Sau khi Refresh Token bị sử dụng, cookie JWT sẽ bị xóa khỏi trình duyệt của người dùng.

# Store table

Bảng store trong một trang web thương mại điện tử được sử dụng để hiển thị danh sách các sản phẩm hoặc dịch vụ mà cửa hàng đang bán. Nó cho phép khách hàng truy cập vào thông tin chi tiết về sản phẩm, giá cả, thông tin khuyến mãi và các tính năng khác của sản phẩm.

# Thư mục utils

Thư mục utils trong Express là một thư mục được sử dụng để chứa các công cụ hữu ích cho ứng dụng Express. Các công cụ này có thể bao gồm các hàm tiện ích, middleware, hoặc các module khác được sử dụng để xử lý các tác vụ phổ biến trong ứng dụng web, chẳng hạn như xác thực, xử lý lỗi, hoặc tạo mã thông báo. Thư mục utils thường được sử dụng để tách các chức năng riêng biệt khỏi các tệp chính của ứng dụng, giúp cho mã nguồn trở nên dễ đọc và dễ bảo trì hơn.
