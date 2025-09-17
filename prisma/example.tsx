// model User {
//   id        Int      @id @default(autoincrement())
//   fullname  String
//   email     String   @unique
//   mobile    String?  
//   password  String
//   cart      Cart?              // 1-to-1 (User → Cart)
//   orders    Order[]            // 1-to-many (User → Orders)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model Product {
//   id        Int      @id @default(autoincrement())
//   image     String
//   title     String
//   price     Float
//   color     String?
//   colorCode String?
//   stock     Int
//   size      String?
//   cartItems CartItem[]         // 1-to-many (Product → CartItems)
//   orderItems OrderItem[]       // 1-to-many (Product → OrderItems)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model Cart {
//   id        Int      @id @default(autoincrement())
//   user      User     @relation(fields: [userId], references: [id])
//   userId    Int      @unique      // each user has only 1 cart
//   items     CartItem[]           // 1-to-many (Cart → CartItems)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model CartItem {
//   id        Int      @id @default(autoincrement())
//   cart      Cart     @relation(fields: [cartId], references: [id])
//   cartId    Int
//   product   Product  @relation(fields: [productId], references: [id])
//   productId Int
//   quantity  Int      @default(1)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model Order {
//   id        Int        @id @default(autoincrement())
//   user      User       @relation(fields: [userId], references: [id])
//   userId    Int
//   orderNo   String     @default(uuid())   // unique order number
//   total     Float
//   status    String     @default("PENDING")
//   items     OrderItem[]                // 1-to-many (Order → OrderItems)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model OrderItem {
//   id        Int      @id @default(autoincrement())
//   order     Order    @relation(fields: [orderId], references: [id])
//   orderId   Int
//   product   Product  @relation(fields: [productId], references: [id])
//   productId Int
//   quantity  Int
//   price     Float    // snapshot price (order time price)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }


// Relations (Easy Version)

// User → Cart : One-to-One (ek user ka ek hi cart hoga)

// User → Orders : One-to-Many (user kai orders place kar sakta hai)

// Cart → CartItems : One-to-Many

// Product → CartItems : One-to-Many

// Order → OrderItems : One-to-Many

// Product → OrderItems : One-to-Many