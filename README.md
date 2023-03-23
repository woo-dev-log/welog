## 우리의 하루, 나의 하루를 기록해봐요!
https://welog.fly.dev/
<!-- 오늘 하루는 무슨 일이 있으셨나요<br>
다른 사람들은 무슨 일이 있었는지 구경해봐요<br> -->

<!-- ## 📒 목차
- [기술스택](#-기술스택)
- [사용모듈](#-사용모듈)
- [성능개선](#-성능개선) -->

## 기술 스택
| 분야            | 사용 기술                                          | 비고  |
| -------------- | ------------------------------------------------ | ---- |
| Front-end      | React, TypeScript, Recoil, React-Query, Scss     |
| Back-end       | Express, Node.js                                 |
| Database       | Mysql - AWS RDS                                  |
| Cloud Services | fly.io                                           |
| Tool           | VsCode, GitHub                                   |

## 사용 모듈
```
모듈명          사용 이유          

react-query    페이지 캐싱을 위해 사용했어요

lodash-es      번들 크기를 줄이기 위하여 lodash-es를 사용하였고,
               무분별한 요청을 제한하기 위해 debounce를 적용했어요
               
react-quill    글 작성 editor 입니다

recoil         전역 상태 관리를 위해 사용했어요

JsonWebToken   보안을 위해 JWT를 활용하여 로그인을 구현했어요

multer         이미지 업로드를 위해 사용했어요

sharp          업로드 되는 이미지를 최적화 하기 위해 사용했어요
```

## 사용자 경험 및 성능 개선
```
skeleton UI
로딩 화면시 사용자 경험을 향상을 위해 skeleton 구현

react-query
게시판 특성상 페이지 요청이 많아 페이지 캐싱을 구현했어요

dynamic import, lazy loading
초기 로딩 시간과 불필요한 리소스 낭비를 줄이기 위하여 코드 스플리팅을 통해 필요한 곳에서만 모듈을 호출했어요

React Suspense
에디터 모듈을 비동기 작업으로 렌더링하여 웹의 성능을 향상시키고 사용자 경험을 개선하였어요

multer & sharp
이미지 업로드시 크기와 용량을 줄여 이미지 최적화를 하였어요

lodash-es in debounce 
회원가입시 중복 확인과 글 검색시 무분별한 호출을 제한하기 위해 사용했어요
```

## 스크린샷
### 예전 메인
![메인-예전](https://user-images.githubusercontent.com/110772642/221354648-c9d2ab94-b08e-4a86-9916-dbb7fafb5fd7.png)

### 메인 화면 변경
![메인-상단](https://user-images.githubusercontent.com/110772642/222924168-a51fc9ce-ecda-4d9c-8f5c-2881a090eba0.png)
![메인-하단](https://user-images.githubusercontent.com/110772642/222924171-a63c189c-c91b-4a34-abb9-ec87562a86a4.png)

### 유저 화면
![유저보드](https://user-images.githubusercontent.com/110772642/223098689-11c54781-a21e-4f74-ac38-d7d3bd4e61c1.png)

### 모바일 & 태블릿 화면
![모바일](https://user-images.githubusercontent.com/110772642/222924176-9e550432-9c82-4d1e-a48f-9d118eeb5247.png)
