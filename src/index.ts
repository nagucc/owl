/**
 * RDF axioms
 *  1. <rdf:type, rdf:type, rdf:Property>
 *  2. 只有rdf:type是rdf:Property的Notion才能作为谓词
 *  3. 所有Notion都具有<., rdf:type, rdfs:Resource>
 */

import triples from 'nagu-triples';
import { Notion } from 'nagu-triples/dist/notions';
import { rdf, rdfs } from './constants';
import { INotion, ITriple } from 'nagu-triples-types';
import { AnnotationProps, IRdfProperty, IRdfsClass, IRdfsResource, RdfsResourceProps } from 'nagu-owl-types';

export class Factory {
  options: any;
  constructor(options) {
    this.options = options;
  }
  async createRdfsResource (uri: INotion<string>|string, forceInit: boolean = true) {
    const res = new RdfsResource(uri, this.options);
    if (forceInit) await res.init();
    return res;
  }
  async createRdfProperty (uri: INotion<string>|string, forceInit: boolean = true) {
    const res = new RdfProperty(uri, this.options);
    if (forceInit) await res.init();
    return res;
  }
  async createRdfsClass(uri: INotion<string>|string, forceInit: boolean = true) {
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
  async destroy() {
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
export class RdfsResource extends Notion<string> implements IRdfsResource {
  public uri: string;
  properties: any[];
  constructor (public iri: Notion<string>|string, protected options: any) {
    super(iri.toString());
    this.iri = iri;
    this.uri = iri.toString();
    this.options = options;
    this.properties = [];
  }

  label: string|Notion<string>;
  comment: string|Notion<string>;
  isDefinedBy: string|Notion<string>|IRdfsResource|RdfsResourceProps & AnnotationProps;
  seeAlso: string|Notion<string>;
  /**
   * 删除原值后添加新值
   */
  async setAnnotations(annotations: AnnotationProps): Promise<void> {
    const { label, comment, isDefinedBy, seeAlso } = annotations;
    const operations = [];
    // 删除原值
    if (this.label) operations.push(this.removePropertyValue(rdfs.label, this.label));
    if (this.comment) operations.push(this.removePropertyValue(rdfs.comment, this.comment));
    if (this.isDefinedBy) operations.push(this.removePropertyValue(rdfs.isDefinedBy, this.isDefinedBy as INotion<string>));
    if (this.seeAlso) operations.push(this.removePropertyValue(rdfs.seeAlso, this.seeAlso));
    await Promise.all(operations);

    // 设置新值
    const setOperations = [];
    setOperations.push(label ? this.setPropertyValue(rdfs.label, label) : {});
    setOperations.push(comment ? this.setPropertyValue(rdfs.comment, comment) : {});
    setOperations.push(isDefinedBy ? this.setPropertyValue(rdfs.isDefinedBy, isDefinedBy.toString()) : {});
    setOperations.push(seeAlso ? this.setPropertyValue(rdfs.seeAlso, seeAlso) : {});
    
    const ts = await Promise.all(setOperations);

    // 修改自身变量
    this.label = ts[0]?.object;
    this.comment = ts[1]?.object;
    this.seeAlso = ts[3]?.object;

    // 设置isDefinedBy字段
    if (ts[2]?.object) {
      const isDefinedByResource = new RdfsResource(ts[2]?.object, this.options);
      await isDefinedByResource.getAnnotations();
      this.isDefinedBy = isDefinedByResource;
    }
  }
  async getAnnotations(): Promise<AnnotationProps & RdfsResourceProps> {
    const [labels, comments, isDefinedBys, seeAlsos] = await Promise.all([
      rdfs.label, rdfs.comment, rdfs.isDefinedBy, rdfs.seeAlso,
    ].map(p => this.getPropertyValues(p)));
    this.label = (labels || [])[0]?.toString() || '';
    this.comment = (comments || [])[0]?.toString() || '';
    this.seeAlso = (seeAlsos || [])[0]?.toString() || '';

    // 设置isDefinedBy字段
    const isDefinedByIRI = (isDefinedBys || [])[0]?.toString() || '';
    if (isDefinedByIRI) {
      const isDefinedByResource = new RdfsResource(isDefinedByIRI, this.options);
      this.isDefinedBy = await isDefinedByResource.getAnnotations();;
    }
    return {
      iri: this.iri,
      label: this.label,
      comment: this.comment,
      isDefinedBy: this.isDefinedBy,
      seeAlso: this.seeAlso,
    }
  }
  
  async getPropertyValues(property: IRdfProperty | string): Promise<Array<IRdfsResource>> {
    // 获取指定属性的所有值
    if (!(property instanceof RdfProperty)) property = new RdfProperty(property.toString(), this.options);
    // 1. 判断给定property是不是属性
    if (!(await property.check())) throw new Error(`${property}违反 RDF axioms 2, 无法获取值`);

    // 2. 获取所有值
    const result = (await triples.listBySP(this.iri, property.toString(), this.options)).map(s => new RdfsResource(s.object.name, this.options));
    this.properties[property.toString()] = result;
    return result;
  }

  async setPropertyValue(property: RdfProperty|string, value: string | INotion<any>): Promise<ITriple> {
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
    // 在数据库清除Resource，包括它的公理、定义
    return 0;
  }

  toString () {
    return this.uri;
  }
}

export class RdfsClass extends RdfsResource implements IRdfsClass {
  async instances(): Promise<RdfsResource[]> {
    const result = await triples.listByPO(rdf.type, this.iri, this.options);
    return result.map(t => new RdfsResource(t.subject, this.options));
  }
  async init() {
    await super.init();
    await this.addType(rdfs.Class);
  }
  async destroy() {
    const rows = await this.removeType(rdfs.Class).catch(() => 0);
    if (!rows) return 0;
    const superRows = await super.destroy().catch(() => 0);
    return rows + superRows;
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
    await super.init();
    // RDF axioms 2. 设置rdf:type 为rdf:Property
    await this.addType(rdf.Property);
  }
  async destroy () {
    const rows = await this.removeType(rdf.Property).catch(e => 0);
    if (!rows) return 0;
    const superRows = await super.destroy().catch(e => 0);
    return rows + superRows;
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