const express = require('express')

const app = express()

const HOST = 'localhost' 
const PORT = 8000
// у приложения express есть метод get, отвечающий за обработку get запроса
// 1 аргументом принимается ссылка запроса
// 2 аргументом принимается callback функция, в которую можно передать 2 аргумента
// их можно записать в переменную req - request(информация о запросе) и
// res - response(для формирования ответа)
app.get("/",(req,res) => {
    console.log("hello")
    // для того чтобы сделать ответ используем объект res и метод send
    res.send('hello woda')
})
app.listen(PORT,HOST,()=>{
    console.log(`Server is running on http://${HOST}:${PORT}`)
})
