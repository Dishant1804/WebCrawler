import { argv } from 'node:process';
import { crawlPage } from './crawl.js';

function main(){
  if(argv.length > 3){
    console.log("Too many arguments provided")
    return
  }
  if(argv.length < 3){
    console.log("Too few arguments provided : please provide website URL")
    return
  }
  const baseURL = argv[2]

  crawlPage(baseURL);
  console.log(`Starting crawl of : ${baseURL}`);
}

main()