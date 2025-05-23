<template>
    <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { MOONWALKER_API_PORT, MOONWALKER_API_HOST } from '../config'
import { ref, watch } from 'vue'
import { useWebSocketDataStore } from '../stores/websocket'
import { storeToRefs } from 'pinia'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
use([GridComponent, BarChart, CanvasRenderer])


const statistics_store = useWebSocketDataStore("statistics")
const statistics_data = storeToRefs(statistics_store)
let historic_chart_data: any = [{}]
const chart_data = ref()
chart_data.value = {
    labels: [],
    datasets: [{}]
}

const option = ref({})

let historic_data = false

// Get new statistics data
watch(statistics_data.json, async (newData) => {
    let labels = []
    let datasets = []

    if (!historic_data) {
        await get_historic_chart_data()
    }

    historic_data = true

    if (newData !== undefined) {
        let websocket_data = JSON.parse(newData)
        let profit_week = websocket_data["profit_week"]
        let profit_month = historic_chart_data["profit_month"]

        for (let key in profit_month) {
            let value = profit_month[key]
            labels.push(key)
            datasets.push(chart_classes(value))
        }

        let actual_day_value = Object.values(profit_week)[Object.values(profit_week).length - 1]

        datasets.splice(datasets.length - 1, 1, chart_classes(actual_day_value))



        chart_data.value = {
            labels: labels,
            datasets: datasets
        }


        option.value = {
            grid: { show: false },
            xAxis: {
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: "#fff" },
                type: 'category',
                data: chart_data.value.labels
            },
            yAxis: {
                axisLabel: { color: "#fff" },
                splitLine: {
                    show: false
                },
                type: 'value'
            },
            series: [
                {
                    color: 'rgb(99, 226, 183)',
                    data: chart_data.value.datasets,
                    type: 'bar',
                    itemStyle: { borderRadius: 4 }
                }
            ]
        }
    }

}, { immediate: true })

async function get_historic_chart_data() {
    let timestamp = Math.floor(Date.now() / 1000)

    historic_chart_data = await fetch(`http://${MOONWALKER_API_HOST}:${MOONWALKER_API_PORT}/statistic/profit/${timestamp}`).then((response) =>
        response.json()
    )

}

function chart_classes(data: any) {
    let column_color = 'rgb(99, 226, 183)'
    if (Math.sign(data) <= 0) {
        column_color = 'rgb(224, 108, 117)'
    }
    return {
        value: data,
        itemStyle: {
            color: column_color
        }
    }
}

</script>

<style scoped>
.chart {
    height: 40vh;
    max-width: 100%;
    margin-top: -50px;
    margin-bottom: -30px;
}
</style>
