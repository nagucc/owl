import assert from 'assert';
import { Factory, RDF } from '../src/index.js';
import { options } from './config.js';
import { type } from 'os';
const factory = new Factory(options);

const uriProeprty = `http://owl.ynu.edu.cn/Example#Property`;
let property;


describe('RdfProperty 类', () => {
  before(async () => {
    property = await factory.createRdfProperty(uriProeprty);
  })
  it('检测属性合法性 check', async () => {
    const res = await property.check();
    assert.equal(res, false);
  });

  it('初始化为rdf:Property - init', async () => {
    await property.init();
    const types = await property.types();
    assert.equal(types[0].uri, uriProeprty);
  });
  it('定义域设置/获取/移除 - domain', async () => {
    await property.addDomain(uriProeprty);
    const domains = await property.types();
    assert.ok(domains.some(d => d == uriProeprty));
    await property.removeDomain(uriProeprty);
    assert.ok(!domains.some(d => d == uriProeprty));
  });

  it('销毁rdf:Property - destroy', async () => {
    await property.destroy();
    const res = await property.check();
    assert.equal(res, false);
  })
});

