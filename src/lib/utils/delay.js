
import { getNode } from '../dom/getNode.js'
import { insertLast } from '../dom/insert.js';
import { isNumber, isObject } from './typeOf.js'
import { xhrPromise } from './xhr.js';

// 이상원, 박수양, 조윤주, 정현주, 박주현




function delay(callback,timeout = 1000){
  setTimeout(callback,timeout);
}


// Promise API

const defaultOptions = {
  shouldReject:false,
  timeout:1000,
  data: '아싸 성공!',
  errorMessage:'알 수 없는 오류가 발생했습니다.'
}


export function delayP(options){

  let config = {...defaultOptions};
  
  if(isNumber(options)){
    config.timeout = options;
  }
  
  if(isObject(options)){
    config = {...defaultOptions,...options}
  }
  
  let {timeout,shouldReject,errorMessage,data} = config

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if(!shouldReject){
        resolve(data);
      }else{
        reject({message:errorMessage})
      }
    }, timeout);
  })
}





// promise object


// async - 함수가 promise 객체를 반환 하도록
//       - await 사용 -> promise 객체 

// await - 코드의 실행 흐름 제어 (멈춤)
//       - result값 가져오기 


async function delayA(data){
  return data
}












































