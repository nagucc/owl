/* eslint-disable no-undef */
import assert from 'assert';
import { Factory, RDFS } from '../src/index.js';
import { options } from './config.js';

const factory = new Factory(options);
const prefix = 'http://www.example.com/Example#';

describe('RDF 公理', () => {
  before(async () => {
    await factory.init();
  });
  
  it('非Property不能作为谓词使用', async () => {
    const someRes = factory.createRdfResource(`${prefix}SomeResource`);
    await assert.rejects(
      () => someRes.setPropertyValue(someRes, 'value'),
      Error,
    );
  });

  it('只有Property才能作为谓词使用', async () => {
    const label = factory.createRdfProperty(RDFS.terms.label);
    await label.setPropertyValue(label, 'value');
    let obj = await label.getPropertyValues(label);
    assert.equal(obj.length, 1);

    // 清理数据
    await label.removePropertyValue(label, 'value');
  });
  it('定义域与值域', async() => {
    const Person = await factory.createRdfsClass(`${prefix}Person`);
    const Alice = await factory.createRdfResource(`${prefix}Alice`);
    await Alice.addType(Person);
    const Bob = await factory.createRdfResource(`${prefix}Bob`);
    await Bob.addType(Person);
    const hasFriend = await factory.createRdfProperty(`${prefix}hasFriend`);
    await hasFriend.setDomain(RDFS.terms.Class);
    await hasFriend.setRange(RDFS.terms.Class);
    
  });

  after(async () => {
    await factory.destory();
  });
});
