CREATE TABLE orderitem (
order_id INTEGER REFERENCES menu_items(id) NOT NULL,
menu_item_id INTEGER REFERENCES orders(id) NOT NULL,
quantity SMALLINT DEFAULT 0

PRIMARY KEY (order_id, menu_item_id)
);
