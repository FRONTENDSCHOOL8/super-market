import {
  initHeader,
  getStorage
} from '/src/lib';
import pb from '/src/lib/api/pocketbase.js';
import '/src/styles/style.scss';


initHeader();

const {isAuth, user} = await getStorage('auth');
if(!isAuth) {
  
  alert('로그인 후 이용해 주세요.')
  location.href = '/src/pages/login/';
}