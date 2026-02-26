import * as fs from 'fs';
const text = fs.readFileSync('packages/crud-typeorm/test/b.query-params.spec.ts', 'utf8');
const injected = text.replace(
  "it('should return nextCursor with initial request', async () => {",
  "it('should return nextCursor with initial request', async () => {\n" + 
  "        const initialQuery = qb.setLimit(2).sortBy({ field: 'id', order: 'ASC' }).query();\n" +
  "        try { \n" +
  "          const res = await request(server).get('/projects-cursor').query(initialQuery);\n" + 
  "          console.log(res.body);\n" +
  "        } catch (e) { console.error('ERR', e); }\n"
);
fs.writeFileSync('b_temp.ts', injected);
