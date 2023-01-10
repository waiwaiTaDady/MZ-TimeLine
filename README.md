<h1 align="center">Welcome to mz-timeline 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/mz-timeline" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/mz-timeline.svg">
  </a>
  <a href="https://github.com/waiwaiTaDady/MZ-TimeLine#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/waiwaiTaDady/MZ-TimeLine/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/waiwaiTaDady/MZ-TimeLine/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/waiwaiTaDady/mz-timeline" />
  </a>
</p>

### 🏠 [Homepage](https://github.com/waiwaiTaDady/MZ-TimeLine#readme)

## Install

```sh
npm install mz-timeline
```

## Usage

```sh
const times = [
    "2018-12-19",
    "2019-02-19",
    "2019-10-01",
    "2020-10-01",
    "2020-10-10",
    "2020-11-10",
    "2021-08-08",
    "2021-10-16",
    "2021-12-08",
    "2021-12-16",
    "2022-01-11",
    "2022-09-09",
    "2022-09-11",
    "2022-11-09",
  ];
  
const App = () => {
    return (
        <>
            <TimeLineF data = {times}/>
        </>
    );
}

OptionalProps/InitSizeDefault

initTLSize = {
    width: 800,  //containersize
    height: 120,  //containersize
    arrowsWidth: 10, //sliderwidth
    pointWidth: 2, //timepintwidth
    top: "2%", //position
    left: "5%", //position 
}

```

## UI

![image](/imgs/mz-timeline.jpg)


## Author

👤 **waiwaiTaDady**

* Github: [@waiwaiTaDady](https://github.com/waiwaiTaDady)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/waiwaiTaDady/MZ-TimeLine/issues). You can also take a look at the [contributing guide](https://github.com/waiwaiTaDady/MZ-TimeLine/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2023 [waiwaiTaDady](https://github.com/waiwaiTaDady).<br />
This project is [MIT](https://github.com/waiwaiTaDady/MZ-TimeLine/blob/master/LICENSE) licensed.
