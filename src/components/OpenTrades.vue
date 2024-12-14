<template>
    <n-data-table size="small" remote ref="table" :columns="columns_open_trades" :data="open_trades" :row-class-name="row_classes" />
</template>

<script setup lang="ts">
import { h, ref, toValue, watch } from 'vue'
import { type DataTableColumns, NTimeline, NTimelineItem, NDivider, NSlider, type SliderProps } from 'naive-ui'
import { useWebSocketDataStore } from '../stores/websocket'
import { storeToRefs } from 'pinia'
import { isFloat } from '../helpers/validators'

const open_trade_store = useWebSocketDataStore("openTrades")
const open_trade_data = storeToRefs(open_trade_store)
const open_trades = ref()

watch(open_trade_data.json, async (newData) => {
    if (newData !== undefined) {
        const websocket_data = JSON.parse(newData)
        open_trades.value = websocket_data

        websocket_data.forEach(function (val: any, i: any) {
            var amount_length = 0
            var cost_length = 0
            var tp_length = 0
            var avg_length = 0
            var current_length = 0
            if (isFloat(val.amount)) {
                amount_length = open_trades.value[i].amount.toString().split('.')[1].length
            }

            if (isFloat(val.cost)) {
                cost_length = open_trades.value[i].cost.toString().split('.')[1].length
            }

            if (isFloat(val.tp_price)) {
                tp_length = open_trades.value[i].tp_price.toString().split('.')[1].length
            }

            if (isFloat(val.avg_price)) {
                avg_length = open_trades.value[i].avg_price.toString().split('.')[1].length
            }

            if (isFloat(val.current_price)) {
                current_length = open_trades.value[i].current_price.toString().split('.')[1].length
            }

            open_trades.value[i].cost = val.cost.toFixed(cost_length)
            open_trades.value[i].profit = val.profit.toFixed(2)
            open_trades.value[i].amount = val.amount.toFixed(amount_length)
            open_trades.value[i].current_price = val.current_price.toFixed(current_length)
            open_trades.value[i].tp_price = val.tp_price.toFixed(tp_length)
            open_trades.value[i].avg_price = val.avg_price.toFixed(avg_length)
            open_trades.value[i].key = val.id
            let date = new Date(Math.trunc(parseFloat(val.open_date)));
            open_trades.value[i].open_date = date.toLocaleString()
            open_trades.value[i].safetyorder = val.safetyorders
            
        })
    }
}, { immediate: true })

type RowData = {
    id: number
    symbol: string
    amount: number
    cost: number
    profit: number
    profit_percent: number
    current_price: number
    tp_price: number
    avg_price: number
    so_count: number
    open_date: string
    baseorder: OrderData
    safetyorder: Array<OrderData>
}

type OrderData = {
    id: number
    timestamp: string
    ordersize: number
    amount: number
    symbol: string
    price: number
}

function row_classes(row: RowData) {
    if (Math.sign(row.profit_percent) >= 0) {
        return 'green'
    } else {
        return 'red'
    }
}

const columns_trades = (): DataTableColumns<RowData> => {
    return [
        {
            type: 'expand',
            expandable: (rowData) => rowData.symbol != "",
            renderExpand: (rowData) => {
                const timeline = h(
                    NTimeline, {
                    horizontal: false
                }, () => {
                    let timeline_items: Array<any> = []
                    // Baseorder
                    let timestamp = new Date(Math.trunc(parseFloat(rowData.baseorder.timestamp)))
                    let date = timestamp.toLocaleString()
                    timeline_items[0] = h(NTimelineItem, {
                                title: "Baseorder",
                                content: "Order size: " + rowData.baseorder.ordersize + " | Amount: " + rowData.baseorder.amount + " | Price: " + rowData.baseorder.price,
                                type: 'info',
                                time: date,
                            })

                    // Safety Orders
                    if (rowData.safetyorder) {
                        console.log(rowData.safetyorder)    
                        rowData.safetyorder.forEach (function (val: any, i: any) {
                            let timestamp = new Date(Math.trunc(parseFloat(val.timestamp)))
                            let date = timestamp.toLocaleString()
                            timeline_items[(i + 1)] = h(NTimelineItem, {
                                title: "Safetyorder " + (i + 1),
                                content: "Order size: " + val.ordersize + " | Amount: " + val.amount + " | Price: " + val.price + " | Percentage: " + val.so_percentage,
                                type: 'success',
                                time: date,
                            })
                    })
                    }
                    return timeline_items

                    
                },
                )
                return timeline
            },
        },
        {
            title: '#',
            key: 'key',
            render: (_, index) => {
                return `${index + 1}`
            }
        },
        {
            title: 'Symbol',
            key: 'symbol',
        },
        {
            title: 'Cost',
            key: 'amount',
            render: (rowData) => {
                const [symbol, currency] = rowData.symbol.split("/")
                const amount = rowData.amount + " " + symbol
                const cost = rowData.cost + " " + currency
                return [
                    h('div', { innerHTML: amount }),

                    h(NDivider, { dashed: true }),
                    h('div', { innerHTML: cost }),
                ]
            }
        },
        {
            title: 'PNL',
            key: 'profit',
            render: (rowData) => {
                const [symbol, currency] = rowData.symbol.split("/")
                const profit_percent = rowData.profit_percent.toFixed(2) + " %"
                const pnl = rowData.profit + " " + currency
                return [
                    h('div', { className: 'profit', innerHTML: profit_percent }),
                    h(NDivider, { dashed: true }),
                    h('div', { innerHTML: pnl }),
                ]
            }
        },
        {
            title: 'AP / TP',
            key: 'tp_price',
            render: (rowData) => {
                const avg_price = rowData.avg_price
                const tp_price = rowData.tp_price
                const current_price = rowData.current_price
                const min_price = (avg_price - (avg_price / 100) * 0.7)
                const max_price = (tp_price / 100) * 0.7 + Number(tp_price)
                const marks = { [avg_price]: 'avg', [tp_price]: 'tp' }
                const fillColor = ref()
                if (current_price < avg_price) {
                    fillColor.value = 'rgba(255, 0, 4, 1)'
                } else {
                    fillColor.value = 'rgba(24, 160, 83, 1)'
                }
                return [
                    h(NSlider, { value: [current_price, avg_price], range: true, marks: marks, min: min_price, max: max_price, disabled: true, themeOverrides: { fillColor: fillColor.value, handleSize: '8px', opacityDisabled: '1' } }),
                ]
            },
            align: 'center'
        },
        {
            title: 'Safety Order Count',
            key: 'so_count',
            align: 'center'
        },
        {
            title: 'Open Date',
            key: 'open_date',
            align: 'center'
        },
    ]
}

const columns_open_trades = columns_trades()

</script>

<style scoped>
:deep(.red .profit) {
    color: rgb(224, 108, 117) !important;
}

:deep(.green .profit) {
    color: rgb(99, 226, 183) !important;
}

.n-data-table {
    width: 97%;
}
</style>


