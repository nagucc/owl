import assert from 'assert';
import triples from 'nagu-triples';
import { Factory, RDF } from '../src/index.js';
import { options } from './config.js';


const factory = new Factory(options);
const exmapleResource = `http://owl.ynu.edu.cn/Example#Resource`;

let resource;

describe('RdfsResouce 类', () => {
  before(async () => {
    resource = await factory.createRdfResource(exmapleResource);
  })
  it('获取属性值 getPropertyValues - 给定的Notion不是Property,抛出异常', async () => {
    await assert.rejects(
      (() => resource.getPropertyValues(resource)),
      Error,
    );
  });

  it('获取属性值 getPropertyValues - 正常', async () => {
    const values = await resource.getPropertyValues(RDF.terms.type);
    assert.equal(values.length, 0);
  });

  it('设置属性值 setPropertyValue', async () => {
    const res = await resource.setPropertyValue(RDF.terms.type, exmapleResource);
    assert.ok(res instanceof triples.Triple);
    const values = await resource.getPropertyValues(RDF.terms.type);
    assert.equal(values.length, 1);
    assert.equal(values[0], exmapleResource);
  });
  it('移除属性值', async () => {
    const res = await resource.removePropertyValue(RDF.terms.type, exmapleResource);
    assert.equal(res, 1);
  });
  it('获取类型 types - 正常', async () => {
    const types = await resource.types();
    assert.equal(types.length, 0);
  });
  it('添加类型 addType - 正常', async () => {
    await resource.addType(exmapleResource);
    const types = await resource.types();
    assert.equal(types.length, 1);
  });
  it('移除类型 removeType - 正常', async () => {
    await resource.removeType(exmapleResource);
    const types = await resource.types();
    assert.equal(types.length, 0);
  });
  
  it('转换为字符串时为uri', () => {
    assert.equal(resource, exmapleResource);
  });
});
