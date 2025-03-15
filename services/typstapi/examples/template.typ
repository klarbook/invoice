#let data = json("data.json")

#set document(title: "Template Test")
#set page(margin: 2cm)

= Complex Template Example

Title: #data.title
Author: #data.author
Content: #data.content

// Display a simple table if it exists
#if "table" in data.keys() [
  *Table from JSON data:*
  
  - First row: #data.table.rows.at(0).at(0), #data.table.rows.at(0).at(1), #data.table.rows.at(0).at(2)
]