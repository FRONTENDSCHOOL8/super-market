import { initHeader, getNode, getStorage, setStorage } from '/src/lib';
import pb from '/src/lib/api/pocketbase.js';
import defaultAuthData from '/src/lib/api/defaultAuthData';
import '/src/styles/style.scss';

initHeader();

const checkUserAuth = async () => {
  const { isAuth, user } = await getStorage('auth');
  if (!isAuth) {
    alert('로그인 후 이용해 주세요.');
    location.href = '/src/pages/login/';
  }
};

checkUserAuth();

const leaveKarlyBtn = getNode('.leave-karly');

leaveKarlyBtn.addEventListener('click', async () => {
  const { user } = await getStorage('auth');
  alert(
    '고객님께서 회원 탈퇴를 원하신다니 저희 쇼핑몰의 서비스가 많이 부족하고 미흡했나 봅니다. 불편하셨던 점이나 불만사항을 알려주시면 적극 반영해서 고객님의 불편함을 해결해 드리도록 노력하겠습니다.'
  );
  let leaveConfirm = confirm('정말 저희 슈퍼마켙을 떠나버리시겠습니까?');
  if (leaveConfirm) {
    await pb
      .collection('users')
      .delete(user.id)
      .then(() => {
        alert(
          `${user.name}님 그동안 이용해 주셔서 감사했습니다. 메인 페이지로 이동합니다.`
        );
        setStorage('auth', defaultAuthData);
        location.href = '/';
      });
  }
});
