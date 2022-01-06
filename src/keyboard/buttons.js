import {Action} from "../constants/actions.js";

export const buttons = {
    SET_AUTH: [
        [Action.LOGIN],
        [Action.FAQ],
    ],
    BACK: [
        [Action.BACK]
    ],
    MAIN_MENU: [
        [Action.SEND_ORDER_FOR_SELLERS],
        [Action.MAKE_ORDER, Action.VIEW_ORDERS],
        [Action.FAQ]
    ],
    VERIFY_ORDER: [
        [Action.CONTINUE, Action.SEND_ORDER],
        [Action.MAIN_MENU]
    ],
    BUTTON_MAIN_MENU: [
        [Action.BUTTON_MAIN_MENU]
    ]
};