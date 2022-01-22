import { Telegraf, Markup, session } from "telegraf";
import { Scenes } from "telegraf";
import dotenv from 'dotenv';
import procces from 'process';
import Order from "./models/order.model.js";
import Product from "./models/products.model.js";
import Users from "./models/user.model.js";
import { buttons } from "./keyboard/buttons.js";
import { Action } from "./constants/actions.js";
import loginScene from './controllers/login.controller.js'
import orderScene from './controllers/order.controller.js';
import sendOrdersScene from './controllers/sendOrders.controller.js'
import moment from "moment";
import typeorm from "typeorm";

dotenv.config();

const connect = () => {
    const options = {
        name: "adelace",
        type: "mongodb",
        url: procces.env.DB_URL,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
        synchronize: true,
        logging: true,
        entities: [
            Order,
            Product,
            Users
        ],
    }

    return typeorm.createConnection(options)
  }

const bot = new Telegraf(procces.env.BOT_TOKEN);

const stage = new Scenes.Stage(
    [
        loginScene,
        orderScene,
        sendOrdersScene
    ]
);

bot.use(session());
bot.use(stage.middleware())

bot.start((ctx) => {
    try {
        if (ctx.chat.type == 'private') {
            ctx.reply(`Здравствуйте, ${ctx.chat.first_name}`, 
            Markup.keyboard(buttons.SET_AUTH)
            .resize()
            );
        } else {
            ctx.reply(`Бот запущен в группе - ${ctx.chat.id}`)
        }
    } catch (e) {
        console.log(e);
    }
});

bot.hears(Action.LOGIN, ctx => {
    ctx.scene.enter('loginScene')
})

bot.hears(Action.BACK, (ctx) => {
    ctx.scene.leave();
    ctx.reply(`Здравствуйте, ${ctx.chat.first_name}`, 
        Markup.keyboard(buttons.SET_AUTH)
        .resize()
        );
})

bot.hears(Action.SEND_ORDER_FOR_SELLERS, ctx => {
    ctx.scene.enter('sendOrdersScene')
})

bot.hears(Action.MAKE_ORDER, ctx => {
    ctx.scene.enter('orderScene')
})

bot.hears(Action.FAQ, async (ctx) => {
    await ctx.replyWithPhoto({url: 'https://sun9-36.userapi.com/impg/u-4a-1vB1cOaiO0FtLJ3l1SvQjfLFYItSxmHiw/x6Joh4eHV4Y.jpg?size=609x471&quality=96&sign=e7553e7be1256d84f6b65a683d18f04f&type=album'});
    await ctx.reply('Команда разработчиков состоит из двух человек\nЕсли увидите ошибки, пишите сюда: help@mail.ru\n\nДанный бот является посредником между покупателем и продавцом\n\n');
})

bot.hears(Action.ORDERS, ctx => {
    ctx.reply('Просматриваю заказы. . .',
    Markup.keyboard(buttons.ORDERS)
    .resize())
})

bot.hears(Action.MAIN_MENU, ctx => {
    ctx.reply('Главное меню',
    Markup.keyboard(buttons.MAIN_MENU)
    .resize())
})

bot.hears(Action.VIEW_ORDERS, async ctx => {
    const chatId = ctx.chat.id
    sendOrderByQuery(ctx, chatId)
})

bot.hears(Action.BUTTON_MAIN_MENU, ctx => {
    ctx.reply('Привет дружище', 
    Markup.keyboard(buttons.MAIN_MENU)
    .resize());
    return ctx.scene.leave()
})

bot.hears(/c/, async ctx => {
    let orderId = ctx.message.text;
    orderId = orderId.substring(2, 5);
    const productRep = typeorm.getMongoRepository(Product, 'adelace')
    if (ctx.chat.id > 0) {
        ctx.reply(orderId)
        sendProductByQuery(ctx, orderId)
    }

    if (ctx.chat.id < 0) {
        let html;
        productRep.find({orderId: Number(orderId)}).then(async product => {
            let count = 0,
            user_id;
            html = product.map ((f, i) => {
                count++;
                user_id = f.chatId
                return `=========================\n 📦Товар: ${f.nameProduct}\n ⚖️Количество: ${f.value}`;
            }).join('\n');

            html += `\n=========================\n\nID клиента: -${user_id}\nID заказа: +${orderId}`

            return await ctx.telegram.sendMessage('-1001756421815', html,
            Markup.inlineKeyboard(
                [
                    [
                        {text: '✔️ Принять', callback_data: '✔️ Принять'}, {text: '❌ Отменить', callback_data: '❌ Отменить'}
                    ],
                    [
                        {text: '📦 Готов к выдаче', callback_data: '📦 Готов к выдаче'}
                    ]
                ]
            ))
        });
    }
})

function sendOrderByQuery(ctx, chatId) {
    let html;
    const orderRep = typeorm.getMongoRepository(Order, 'adelace')
    orderRep.find({ where: { chatId: chatId} }).then(async orders => {
        let count = 0;
        html = orders.map ((f, i) => {
            count++;
            return `=============================\n <b>Заказ #${i + 1}</b>\n <b>✅Статус:</b> ${f.status}\n <b>📅Обновлено:</b> ${moment(f.createdAt).format('DD.MM.YYYY, h:mm')}\n <b>🔎Подробнее:</b> /c${f.orderId}`;
        }).join('\n');

        html += `\n=============================\n\n<b><i>📮Всего заказов:</i></b> ${count}`
        await ctx.replyWithHTML(html)
    }).catch((e) => {
        console.log(e)
    });
}

function sendProductByQuery(ctx, orderId) {
    let html;
    const productRep = typeorm.getMongoRepository(Product, "adelace")
    productRep.find({where: {orderId: Number(orderId)}}).then(async product => {
        let count = 0;
        html = product.map ((f, i) => {
            count++;
            return `===================\n <b>📦Товар:</b> ${f.nameProduct}\n <b>⚖️Кол-во:</b> ${f.value}`;
        }).join('\n');

        html += `\n===================\n\n<b><i>🧺Всего товаров:</i></b> ${count}`
        await ctx.replyWithHTML(html)
    });
}

bot.action('✔️ Принять', ctx => {
    const orderRep = typeorm.getMongoRepository(Order, "adelace")
    const msg = ctx.callbackQuery.message.text
    let user_id = msg.substring(msg.indexOf('-') + 1)
    let order_id = msg.substring(msg.indexOf('+') + 1)
    
    if (ctx.from.id == 258752149) {
        ctx.answerCbQuery('Заказ принят')
        ctx.telegram.sendMessage(user_id, 'Торговец принял ваш заказ\nОбновляю статус заказов. . .')

        orderRep.updateMany({orderId: order_id},
            {
                $set: {
                    status: 'В обработке'
                }
            }).then(console.log('upd: status'))
        
        ctx.pinChatMessage(ctx.callbackQuery.message.message_id)

    } else {
        ctx.answerCbQuery('Ты не торговец', ctx.from.id)
        ctx.reply(`${ctx.from.first_name}, Ты не торговец`)
    }
})

bot.action('❌ Отменить', ctx => {
    const msg = ctx.callbackQuery.message.text
    const user_id = msg.substring(msg.indexOf('-') + 1)

    if (ctx.from.id == 258752149) {
        ctx.answerCbQuery('Заказ отменён')
        ctx.telegram.sendMessage(user_id, 'Торговец отменил ваш заказ')
    } else {
        ctx.answerCbQuery('Ты не торговец', ctx.from.id)
        ctx.reply(`${ctx.from.first_name}, Ты не торговец`)
    }
})

bot.action('📦 Готов к выдаче', ctx => {
    const orderRep = typeorm.getMongoRepository(Order, "adelace")
    const msg = ctx.callbackQuery.message.text
    let user_id = msg.substring(msg.indexOf('-') + 1)
    let order_id = msg.substring(msg.indexOf('+') + 1)
    
    if (ctx.from.id == 258752149) {
        ctx.answerCbQuery('Заказ готов к выдаче')
        ctx.telegram.sendMessage(user_id, 'Торговец готов выдать товар\nОбновляю статус заказов. . .')

        orderRep.updateMany({orderId: Number(order_id)},
            {
                $set: {
                    status: 'Готов к выдаче'
                }
            }).then(console.log('upd: status'))

    } else {
        ctx.answerCbQuery('Ты не торговец', ctx.from.id)
        ctx.reply(`${ctx.from.first_name}, Ты не торговец`)
    }
})

bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => {
    ctx.reply(`${ctx.message.text}`)
});

connect()
  .then(() => {
    bot.use(stage.middleware())
    bot.launch();
    console.log('Connected to database')
  })
  .catch((error) => console.log('Connect failed, error:', error))