/* ERD Uses https://dbdiagram.io/d */

Table customers {
  id UUID [pk]
  name VARCHAR
  customer_metering_settings JSON
  billing_settings JSON
}

Table products {
  id UUID [pk]
  name VARCHAR
  description TEXT
  product_metering_settings JSON
  pricing JSON
}

Table plans {
  id UUID [pk]
  name VARCHAR
  description TEXT
}

Table plan_products {
  id UUID [pk]
  plan_id UUID
  product_id UUID
}

Table contracts {
  id UUID [pk]
  name VARCHAR
  customer_id UUID
  plan_id UUID
  duration VARCHAR
  start_date DATE
  billing_schedule JSON
  renewal_settings JSON
  revision_settings JSON
  termination_settings JSON
}

Table invoices {
  id UUID [pk]
  customer_id UUID
  contract_id UUID
  issue_date DATE
  due_date DATE
  billing_period JSON
  status VARCHAR
  total_amount DECIMAL
  last_calculated TIMESTAMP
  calculation_status VARCHAR
}

Table line_items {
  id UUID [pk]
  invoice_id UUID
  product_id UUID
  plan_product_id UUID
  description TEXT
  pricing_type VARCHAR
  units DECIMAL
  unit_price DECIMAL
  total DECIMAL
  overridden_by_user BOOLEAN
  last_calculated TIMESTAMP
  calculation_status VARCHAR
  revision_history JSON
}

Table events {
  id UUID [pk]
  name VARCHAR
  ref VARCHAR
  customer_alias VARCHAR
  timestamp TIMESTAMP
  data JSON
  customer_link_status VARCHAR
  product_link_status VARCHAR
  charge_link_status VARCHAR
}

Ref: plan_products.plan_id > plans.id
Ref: plan_products.product_id > products.id
Ref: contracts.customer_id > customers.id
Ref: contracts.plan_id > plans.id
Ref: invoices.customer_id > customers.id
Ref: invoices.contract_id > contracts.id
Ref: line_items.invoice_id > invoices.id
Ref: line_items.product_id > products.id
Ref: line_items.plan_product_id > plan_products.id