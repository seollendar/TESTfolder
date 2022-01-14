# Reporter Platform
> dashboard based on paper dashboard UI template + vue-router

This project is a vue version of [Paper-dashboard](https://www.creative-tim.com/product/paper-dashboard)
designed for vue js.The dashboard includes vue-router

## DEMO
![](/src/assets/demo/dashboard_demo.gif)

## Build Setup

### install dependencies
```
npm install
```
### serve with hot reload at localhost:8080
```
npm run dev
```
### build for production with minification
```
npm run build
```
### lint
```
npm run lint
```

### build for production with Docker and API Server
```
docker build -t smart_port_web . 
docker run -it -p 7979:7979 --rm --name dockerize-smart-port-app smart_port_web
```

## License

[MIT](https://github.com/creativetimofficial/vue-paper-dashboard/blob/master/LICENSE.md)

