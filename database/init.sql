CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    sale_date DATE NOT NULL,
    sales_amount REAL NOT NULL
);

INSERT INTO sales (product_name, sale_date, sales_amount) VALUES
('Laptop', '2025-07-01', 1200.50),
('Phone', '2025-07-02', 800.25),
('Tablet', '2025-07-03', 600.75),
('Laptop', '2025-07-04', 1500.00),
('Phone', '2025-07-05', 900.30); 
