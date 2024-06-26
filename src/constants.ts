const rdfPrefix = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
export const rdf = {
  type: `${rdfPrefix}type`,
  Property: `${rdfPrefix}Property`,
  Statement: `${rdfPrefix}Statement`,
  subject: `${rdfPrefix}subject`,
  predicate: `${rdfPrefix}predicate`,
  object: `${rdfPrefix}object`,
  Bag: `${rdfPrefix}Bag`,
  Seq: `${rdfPrefix}Seq`,
  Alt: `${rdfPrefix}Alt`,
  value: `${rdfPrefix}value`,
  List: `${rdfPrefix}List`,
  nil: `${rdfPrefix}nil`,
  first: `${rdfPrefix}first`,
  rest: `${rdfPrefix}rest`,
  XMLLiteral: `${rdfPrefix}XMLLiteral`,
  JSON: `${rdfPrefix}JSON`,
  CompoundLiteral: `${rdfPrefix}CompoundLiteral`,
  language: `${rdfPrefix}language`,
  direction: `${rdfPrefix}direction`,
}

const rdfsPrefix = 'http://www.w3.org/2000/01/rdf-schema#';
export const rdfs = {
  subClassOf: `${rdfsPrefix}subClassOf`,
  subPropertyOf: `${rdfsPrefix}subPropertyOf`,
  Literal: `${rdfsPrefix}Literal`,
  Class: `${rdfsPrefix}Class`,
  Resource: `${rdfsPrefix}Resource`,
  Container: `${rdfsPrefix}Container`,
  Datatype: `${rdfsPrefix}Datatype`,
  seeAlso: `${rdfsPrefix}seeAlso`,
  label: `${rdfsPrefix}label`,
  comment: `${rdfsPrefix}comment`,
  domain: `${rdfsPrefix}domain`,
  range: `${rdfsPrefix}range`,
  member: `${rdfsPrefix}member`,
  isDefinedBy: `${rdfsPrefix}isDefinedBy`,
}
