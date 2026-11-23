export const example = `// Store schema
Table customers {
  id integer [pk]
  email varchar [unique]
  name varchar
  created_at timestamp
}

Table categories {
  id integer [pk]
  name varchar
}

Table orders {
  id integer [pk]
  customer_id integer [not null]
  status varchar
  total decimal
  created_at timestamp
}

Table products {
  id integer [pk]
  name varchar
  price decimal
  category_id integer [not null]
}

Table order_items {
  id integer [pk]
  order_id integer [not null]
  product_id integer [not null]
  quantity integer
}

Ref: customers.id < orders.customer_id
Ref: categories.id < products.category_id
Ref: orders.id < order_items.order_id
Ref: products.id < order_items.product_id
`;
