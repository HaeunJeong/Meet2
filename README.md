# 2021, 요즘 누가 유료로 웹서비스 구축 하나, 파이어 베이스의 모든 것-Vue

## Introduction

> 안녕하세여요 데이비드 입니다.
해당 소스는 인프런 수강생 대상으로 배포되는 보일러 플레이트 입니다.
이 소스는 수강자에게만 무료 배포 되는 소스 입니다.
수강자가 아닌 자가 해당 소스를 사용하는 경우 라이센스에 위반이 됩니다.

## Code Explain

```vue
# src / auth : 로그인 세션 관리 하는 소스
# src / components : 외부 컴포넌트 이지만 해당 컴포넌트는 사용하지 않고 antd를 import해서 사용함
# src / i18n : 사이트내 다국어 제어 관련 소스
# src / store : 강의에서 다루지 않은 Vuex 처리 예제, 사용을 하고자 하는 경우 store/auth/ 디렉토리를 참고하면 됩.
# src / views / pages : 강의에서 다룬 페이 관련 소스
# src / main.js : 새로운 모듈 추가시 수정되어야 되는 소스
# src / router.js : 새로운 페이지가 추가시 수정되어야 되는 소스
```

## Installation

```bash
sudo yarn install
yarn run serve
http://localhost:8080/
```

## License
[인프런](https://www.inflearn.com/)
해당 라이센스는 수강생에게만 무료로 제공되는 라이센스 입니다. 수강생이 아닌경우 배포, 복사, 사용이 금지되어 있습니다.