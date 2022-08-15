const workBtnContainer = document.querySelector(`.work__categories`);
const projectContainer = document.querySelector(`.work__projects`);
const projects = document.querySelectorAll(`.project`);
workBtnContainer.addEventListener(`click`, () => {
  const filter =
    event.target.dataset.filter || event.target.parentNode.dataset.filter;
  // category__btn 아래에 있는 span에 적용X(dataset이 미적용) --> parent 값으로 출력.
  // console.log(filter);
  if (filter == null) {
    return;
  }
  projectContainer.classList.add(`anim-out`);
  setTimeout(() => {
    projects.forEach((project) => {
      // forEach((project) {})는 for(let project of projects) {}와 동일함.
      // forEach((project) {})는 for(let i=0; i < projects.length; i++){
      //   project = projects[i];
      // }와도 동일
      // console.log(project.dataset.type); 데이터타입 정상출력 확인.
      if (filter === `*` || filter === project.dataset.type) {
        project.classList.remove(`invisible`);
      } else {
        project.classList.add(`invisible`);
      }
    });
    projectContainer.classList.remove(`anim-out`);
  }, 280);
});