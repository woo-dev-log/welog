## 우리의 하루, 나의 하루를 기록해봐요!
오늘 하루는 무슨 일이 있으셨나요<br>
다른 사람들은 무슨 일이 있었는지 구경해봐요<br>

<!-- ## 📒 목차
- [기술스택](#-기술스택)
- [사용모듈](#-사용모듈)
- [성능개선](#-성능개선) -->

## 기술 스택
| 분야            | 사용 기술                                          | 비고  |
| -------------- | ------------------------------------------------ | ---- |
| Front-end      | React, TypeScript, Recoil, React-Query, Scss     |
| Back-end       | Express, Node.js                                 |
| Database       | Mysql                                            |
| Cloud Services | 생각중                                             |
| Tool           | VsCode, GitHub                                   |

## 사용 모듈
```
모듈명           사용 이유                                         
react-query    페이지 캐싱을 위해 사용
lodash-es      번들 크기를 줄이기 위하여 lodash-es를 사용하였고
               무분별한 호출을 제한하기 위해 debounce 적용
react-quill    글 작성시 Editor
recoil         전역 상태 관리
JsonWebToken   보안을 위해 JWT를 활용하여 로그인 구현
multer         이미지 업로드를 위해 사용           
sharp          업로드 되는 이미지를 최적화 하기 위해 사용
```

## 성능 개선
```
react-query
게시판 특성상 페이지 요청이 많아 페이지 캐싱을 구현했어요

dynamic import, lazy loading
초기 로딩 시간과 불필요한 리소스 낭비를 줄이기 위하여 코드 스플리팅을 통해 필요한 곳에서만 모듈을 호출했어요

multer & sharp
이미지 업로드시 크기와 용량을 줄여 이미지 최적화를 하였어요

lodash-es in debounce 
회원가입시 중복 확인과 글 검색시 무분별한 호출을 제한하기 위해 사용했어요
```

## 메인 화면
<img width="767" alt="welog-main" src="https://user-images.githubusercontent.com/110772642/221354648-c9d2ab94-b08e-4a86-9916-dbb7fafb5fd7.png">
