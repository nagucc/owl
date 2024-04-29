# Nagu OWL
`Nagu OWL`是一个本体论框架，实现了RDF、RDFS、OWL的定义、推理，并基于`Nagu Triples`实现数据存储。

## 公理、定义及推理

### 公理(代码中硬编码)
1. RDF中定义的任何资源都可以作为主体或客体使用，只有`rdf:Property`的实例才能作为三元组的谓词使用;
2. RDF中定义所有资源都是`rdfs:Resource`的一个实例;
3. `rdf:type` 是 `rdf:Property` 的一个实例，即 `<rdf:type, rdf:type, rdf:Property>`。`rdf:type`的定义域是`rdfs:Resource`, 值域是 `rdfs:Class`;

### 定义
1. `rdf:type`是一个属性：`<rdf:type, rdf:type, rdf:Property>`;
2. 基本Class定义
  - `<rdfs:Class, rdf:type, rdfs:Resource>`
  - `<rdfs:Class, rdf:type, rdfs:Class>`
  - `<rdf:Property, rdf:type, rdfs:Class>`
  - `<rdfs:Resource, rdf:type, rdfs:Class>`
  - `<rdf:Statement, rdf:type, rdfs:Class>`
  - `<rdfs:Container, rdf:type, rdfs:Class>`
  - `<rdf:Bag, rdf:type, rdfs:Class>`
  - `<rdf:Seq, rdf:type, rdfs:Class>`
  - `<rdf:Alt, rdf:type, rdfs:Class>`
  - `<rdfs:Literal, rdf:type, rdfs:Class>`
3. 基本属性定义
  - `<rdfs:label, rdf:type, rdf:Property>`
  - `<rdfs:comment, rdf:type, rdf:Property>`
  - `<rdfs:domain, rdf:type, rdf:Property>`
  - `<rdfs:range, rdf:type, rdf:Property>`
  - `<rdf:subject, rdf:type, rdf:Property>`
  - `<rdf:predicate, rdf:type, rdf:Property>`
  - `<rdf:object, rdf:type, rdf:Property>`
  - `<rdf:first, rdf:type, rdf:Property>`
  - `<rdf:rest, rdf:type, rdf:Property>`
  - `<rdf:value, rdf:type, rdf:Property>`
  - `<rdf:nil, rdf:type, rdf:List>`
  - `<rdfs:member, rdf:type, rdf:Property>`
  - `<rdfs:subClassOf, rdf:type, rdf:Property>`
  - `<rdfs:subPropertyOf, rdf:type, rdf:Property>`
4. 定义域与值域
  - 属性的默认定义域和值域为`rdf:Resource`
  - `rdfs:domain`用于定义定义域，满足约束：
    - `<rdfs:domain, rdfs:domain, rdf:Property>`
  - `rdfs:range` 用于定义值域, 满足约束：
    - `<rdfs:range, rdfs:domain, rdf:Property>`
5. 类与子类
  - 定义域：`<rdfs:subClassOf, rdfs:domain rdfs:Class>`
  - 值域：`<rdfs:subClassOf, rdfs:range rdfs:Class>`
  - 性质：当`<ex:B, rdfs:subClassOf, ex:A>`时，如果`<ex:b, rdf:type, ex:B>`，则`<ex:b, rdf:type, ex:A>`;
  - 传递性：如果`<ex:C, rdfs:subClassOf, ex:B>`且`<ex:B, rdfs:subClassOf, ex:A>`，则`<ex:C, rdfs:subClassOf, ex:A>`;
