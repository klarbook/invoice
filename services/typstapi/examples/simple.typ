#let data = json("data.json")

#set document(title: "Simple Document")
#set page(margin: 2cm)

= Hello from TypstAPI!

Title from JSON: #data.title

Message: #data.body