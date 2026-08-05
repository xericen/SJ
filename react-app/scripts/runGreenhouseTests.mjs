import { createServer } from 'vite';

const server=await createServer({
  configFile:false,
  root:process.cwd(),
  server:{middlewareMode:true,watch:null},
  appType:'custom',
  logLevel:'silent',
});
try{
  await server.ssrLoadModule('/scripts/testGreenhouse.ts');
}finally{
  await server.close();
}
