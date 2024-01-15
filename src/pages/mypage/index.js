import {
  initHeader,
  getStorage
} from '/src/lib';
import pb from '/src/lib/api/pocketbase.js';
import '/src/styles/style.scss';


initHeader();

const checkUserAuth = async () => {
  const {isAuth, user} = await getStorage('auth');
  console.log(isAuth);
  if(!isAuth){
    alert('로그인 후 이용해 주세요.')
    location.href = '/src/pages/login/';
  }
  
}

checkUserAuth();