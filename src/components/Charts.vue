<template>
    <Bar id="my-chart-id" :options="chart_options" :data="chart_data" />
</template>

<script setup lang="ts">
import { MOONWALKER_API_PORT, MOONWALKER_API_HOST } from '../config'
import { ref, watch } from 'vue'
import { useWebSocketDataStore } from '../stores/websocket'
import { storeToRefs } from 'pinia'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js'
// import zoomPlugin from 'chartjs-plugin-zoom'
//ChartJS.register(BarElement, Tooltip, CategoryScale, LinearScale, zoomPlugin)
ChartJS.register(BarElement, Tooltip, CategoryScale, LinearScale)

const statistics_store = useWebSocketDataStore("statistics")
const statistics_data = storeToRefs(statistics_store)
let historic_chart_data: any = [{}]
const chart_data = ref()
chart_data.value = {
    labels: [],
    datasets: [{}]
}

let historic_data = false

// Get new statistics data
watch(statistics_data.json, async (newData) => {
    let labels = []
    let datasets = []
    let background_colors = []

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
            datasets.push(value)
            background_colors.push(chart_classes(value))
        }

        let actual_day_value = Object.values(profit_week)[Object.values(profit_week).length - 1]

        datasets.splice(datasets.length - 1, 1, actual_day_value)


        chart_data.value = {
            labels: labels,
            datasets: [{ data: datasets, backgroundColor: background_colors, borderRadius: 5 }]
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
    if (Math.sign(data) >= 0) {
        return 'rgb(99, 226, 183)'
    } else {
        return 'rgb(224, 108, 117)'
    }
}

const chart_options = {
    /* plugins: {
        zoom: {
            limits: {
                x: { min: -1000, max: 1000, minRange: 50 },
            },
            pan: {
                enabled: true,
                mode: 'x' as const,
            },
            zoom: {
                wheel: {
                    enabled: false,
                },
                pinch: {
                    enabled: true
                },
            }
        },
    }, */
    responsive: true,
    scales: {
        x: {
            ticks: {
                color: "white",
            },
            grid: {
                display: false
            }
        },
        y: {
            ticks: {
                color: "white",
            },
            grid: {
                display: false
            }
        }
    }
}

</script>
