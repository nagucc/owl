/**
 * RDF axioms
 *  1. <rdf:type, rdf:type, rdf:Property>
 *  2. 只有rdf:type是rdf:Property的Notion才能作为谓词
 *  3. 所有Notion都具有<., rdf:type, rdfs:Resource>
 */

import triples from 'nagu-triples';
import { Notion } from 'nagu-triples/dist/notions';
import { Triple } from 'nagu-triples/dist/triples';

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
}

export interface IRdfsClass {
  instances(): Promise<Array<RdfsResource>>;
}
export class Factory {
  options: any;
  constructor(options) {
    this.options = options;
  }
  async createRdfResource (uri: Notion<string>|string, forceInit: boolean = true) {
    const res = new RdfsResource(uri, this.options);
    if (forceInit) await res.init();
    return res;
  }
  async createRdfProperty (uri: Notion<string>|string, forceInit: boolean = true) {
    const res = new RdfProperty(uri, this.options);
    if (forceInit) await res.init();
    return res;
  }
  async createRdfsClass(uri: Notion<string>|string, forceInit: boolean = true) {
    const res = new RdfsClass(uri, this.options);
    if (forceInit) await res.init();
    return res;
  }
  async init () {
    //初始化RDF、RDFS、OWL公理、定义，并存储到数据库中
    // 1. <rdf:type, rdf:type, rdf:Property>;(公理，已由代码实现)
    // 2. 基本Class定义
    await Promise.all([
      rdfs.Class,
      rdf.Property,
      rdfs.Resource,
      rdf.Statement,
      rdfs.Container,
      rdf.Seq,
      rdf.Bag,
      rdf.Alt,
      rdfs.Literal,
    ].map(term => {
      const res = new RdfsClass(term, this.options);
      return res.init();
    }));

    // 3. 基本Property定义
    await Promise.all([
      rdfs.label,
      rdfs.comment,
      rdfs.domain,
      rdfs.range,
      rdf.subject,
      rdf.predicate,
      rdf.object,
      rdf.first,
      rdf.rest,
      rdf.value,
      rdf.nil,
      rdfs.subClassOf,
      rdfs.subPropertyOf,
      rdfs.member,
    ].map(term => {
      const res = new RdfProperty(term, this.options);
      return res.init();
    }));
  }
  async destory() {
    // 3. 基本Property定义
    await Promise.all([
      rdfs.label,
      rdfs.comment,
      rdfs.domain,
      rdfs.range,
      rdf.subject,
      rdf.predicate,
      rdf.object,
      rdf.first,
      rdf.rest,
      rdf.value,
      rdf.nil,
      rdfs.subClassOf,
      rdfs.subPropertyOf,
      rdfs.member,
    ].map(term => {
      const res = new RdfProperty(term, this.options);
      return res.destroy();
    }));

    // 2. 基本Class定义
    await Promise.all([
      rdfs.Class,
      rdf.Property,
      rdfs.Resource,
      rdf.Statement,
      rdfs.Container,
      rdf.Seq,
      rdf.Bag,
      rdf.Alt,
      rdfs.Literal,
    ].map(term => {
      const res = new RdfsClass(term, this.options);
      return res.destroy();
    }));
  }
}

/**
 * RDF Resource, rdf:Resource 表示RDF中被描述的资源
 * - 应专注于对"属性"的管理，而非属性值(当下最重要的是实现功能！！)
 */
export class RdfsResource extends Notion<string> {
  public uri: string;
  options: any;
  properties: any[];
  constructor (public iri: Notion<string>|string, options) {
    super(iri.toString());
    this.iri = iri;
    this.uri = iri.toString();
    this.options = options;
    this.properties = [];
  }
  
  async getPropertyValues(property: RdfProperty | string): Promise<Array<RdfsResource>> {
    // 获取指定属性的所有值
    if (!(property instanceof RdfProperty)) property = new RdfProperty(property, this.options);
    // 1. 判断给定property是不是属性
    if (!(await property.check())) throw new Error(`${property}违反 RDF axioms 2, 无法获取值`);

    // 2. 获取所有值
    const result = (await triples.listBySP(this.iri, property, this.options)).map(s => new RdfsResource(s.object.name, this.options));
    this.properties[property.toString()] = result;
    return result;
  }

  async setPropertyValue(property: RdfProperty|string, value: string | Notion<any>): Promise<Triple> {
    if (!(property instanceof RdfProperty)) property = new RdfProperty(property, this.options);
    // 1. 检查property
    if (!(await property.check())) throw new Error(`${property} 不是 rdf:Property, 不能设置属性值`);

    // 设置属性
    return triples.getOrCreate(this, property, value, this.options);
  }

  async removePropertyValue(property: string | RdfProperty, value: string | Notion<any>): Promise<number> {
    // 删除属性的值
    if (!(property instanceof RdfProperty)) property = new RdfProperty(property, this.options);
    // 1. 检查property
    if (!(await property.check())) throw new Error(`${property} 不是 rdf:Property, 不能删除属性值`);

    const statement = await triples.getBySPO(this, property, value, this.options);
    if (!statement?.id) throw new Error(`不存在属性值<${this}, ${property}, ${value}，删除失败`);
    return triples.deleteById(statement.id, this.options);
  }

  /**
   * 获取资源类型列表
   * @returns 类型列表
   */
  async types() {
    return this.getPropertyValues(rdf.type);
  }

  async addType (type) {
    return this.setPropertyValue(rdf.type, type);
  }

  async removeType (type) {
    return this.removePropertyValue(rdf.type, type);
  }

  async init () {
    // 在数据库中构建Resource,包括它的公理、定义
  }

  async destroy () {
    // 在数据库清楚Resource，包括它的公理、定义
  }

  toString () {
    return this.uri;
  }
}

export class RdfsClass extends RdfsResource implements IRdfsClass {
  instances(): Promise<RdfsResource[]> {
    throw new Error('Method not implemented.');
  }
  async init() {
    await this.setPropertyValue(rdf.type, rdfs.Class);
  }
  async destroy() {
    await this.removePropertyValue(rdf.type, rdfs.Class);
  }
}

export class RdfProperty extends RdfsResource implements IRdfsClass {
  constructor (uri: Notion<any>|string, options) {
    super(uri, options)
  }
  async instances(): Promise<RdfsResource[]> {
    const result = await triples.listByPO(rdf.type, rdf.Property, this.options);
    return result.map(t => new RdfsResource(t.subject, this.options));
  }
  async domians() {
    return this.getPropertyValues(rdfs.domain);
  }
  async addDomain(resource) {
    return this.setPropertyValue(rdfs.domain, resource);
  }
  async removeDomain(resource) {
    return this.removePropertyValue(rdfs.domain, resource);
  }
  async ranges() {
    return this.getPropertyValues(rdfs.range);
  }
  async addRange(resource) {
    return this.setPropertyValue(rdfs.range, resource);
  }
  async removeRange(resource) {
    return this.removePropertyValue(rdfs.range, resource);
  }
  async init() {
    // RDF axioms 2. 设置rdf:type 为rdf:Property
    await this.setPropertyValue(rdf.type, rdf.Property);
  }
  async destroy () {
    await this.removePropertyValue(rdf.type, rdf.Property);
  }
  // 检查当前对象是否是Property
  async check(): Promise<boolean> {
    if (this.toString() == rdf.type) return true; // RDF axioms 1
    const res = await this.getPropertyValues(rdf.type);
    return res.some(o => o.toString() == rdf.Property);
  }
}



export const RDF = {
  terms: rdf,
  Property: RdfProperty,
}

export const RDFS = {
  terms: rdfs,
  Resource: RdfsResource,
  Class: RdfsClass,
}

export default {
  Factory,
  RDF,
  RDFS,
}