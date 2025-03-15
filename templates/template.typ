#let data = json("./data.json")

#let bold(content) = {
  text(fill: luma(0%), weight: "semibold", content)
}

#let format(number, precision: 2, decimal_delim: ".", thousands_delim: ",") = {
  let integer = str(calc.floor(number))
  if precision <= 0 {
    return integer
  }

  let value = str(calc.round(number, digits: precision))
  let from_dot = decimal_delim + if value == integer {
    precision * "0"
  } else {
    let precision_diff = integer.len() + precision + decimal_delim.len() - value.len()
    value.slice(integer.len() + 1) + precision_diff * "0"
  }

  let cursor = 3
  while integer.len() > cursor {
    integer = integer.slice(0, integer.len() - cursor) + thousands_delim + integer.slice(integer.len() - cursor, integer.len())
    cursor += thousands_delim.len() + 3
  }
  integer + from_dot
}

#let eur(content) = {
  // content + " EUR"
  // "€" + content
  content + " €"
}

#set text(lang: "de", font: "Inter", size: 10pt, fill: luma(20%))
#set page(paper: "a4", margin: 1.5cm)
#set par(justify: false, leading: .85em)

#block(below: 1.5em, text(size: 2em, bold([Invoice])))



#table(
  columns: (auto, auto),
  inset: 0pt,
  column-gutter: 2em,
  row-gutter: 1em,
  stroke: none,
  [#bold([Invoice number])],[#bold(data.invoiceNumber)],
  [Invoice date],[#data.invoiceDate],
  [Due date],[#data.dueDate],
  
)

#v(1.5em)

#grid(
  columns: (1fr, 1fr),
  [
    #bold(data.sender.name) \
    #data.sender.address1 \
    #data.sender.postalCode #data.sender.city \
    #data.sender.country \
    #data.sender.email \
    // VAT #data.sender.taxId
  ],
  [
    #bold("Bill to") \
    #data.recipient.name \
    #data.recipient.address1  \
    #data.recipient.postalCode #data.recipient.city \
    #data.recipient.country
  ]
)

#v(1em)

#grid(
  columns: (1fr, 200pt),
  align: left,
  [
  ],
  [
     #align(right, table(
      columns: (1fr, auto),
      stroke: none,
      align: horizon,
      inset: (0pt, 3pt),
    ))
  ]
)

#let frame(stroke) = (x, y) => (
  left: if x > 0 { 0pt } else { stroke },
  right: stroke,
  top: if y < 2 { stroke } else { 0pt },
  bottom: stroke,
)

#show heading: set block(above: 1.2em, below: 1.3em)

#let _totalNet = data.lineItems.map(line => line.quantity * line.price).sum()
#let totalNet = format(_totalNet)
#let totalTax = format(_totalNet * 0.19)
#let total = format(_totalNet * 1.19)

#block(below: 1.5em, text(size: 1.5em, bold([#eur(total) due #data.dueDate])))

#block(radius: 3pt, clip: true, [
  #table(
    columns: (1fr, auto, auto, auto),
    stroke: none,
    inset: 6pt,
    fill: (_, y) => if calc.even(y) { luma(95%) },
    table.header(
      bold([Description]), bold([Amount]),bold([Unit price]), bold([Amount])
      // [*Description*], [*Amount*], [*Unit price*], [*Amount*]
    ),
      ..data.lineItems.map(line => {
      (
        [#bold([#line.title]) #v(-5pt) #line.description],
        align(right, format(line.quantity)),
        align(right, eur(format(line.price))),
        align(right, eur(format(line.price * line.quantity)))
      )
    }).flatten(),
    [], [], [], [],
    [Total excluding tax], [], [], align(right, eur(totalNet)),
    [19% VAT], [], [], align(right, eur(totalTax)),
    [#bold([Total])], [], [], align(right, [#bold([#eur(total)])]),
  )
])

#v(2em)

#bold([Pay #eur(total) with a bank transfer])

#v(0.25em)

#table(
  columns: (auto, auto),
  inset: 0pt,
  column-gutter: 2em,
  row-gutter: 1em,
  stroke: none,
  // [BIC],[#data.sender.bic],
  // [IBAN],[#data.sender.iban],
  [Country],[#data.sender.country],
  [Account holder name],[#data.sender.name],
  [Reference],[#data.invoiceNumber],
)

