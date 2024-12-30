<template>
        <Bar
            id="my-chart-id"
            :options="chart_options"
            :data="chart_data"
        />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWebSocketDataStore } from '../stores/websocket'
import { storeToRefs } from 'pinia'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js'
ChartJS.register(BarElement, Tooltip, CategoryScale, LinearScale)

const statistics_store = useWebSocketDataStore("statistics")
const statistics_data = storeToRefs(statistics_store)
let historic_chart_data: any = [{}]
const chart_data  = ref()
chart_data.value = {
    labels: [],
    datasets: [{ }]
}

const api_port = 8120
const hostname = window.location.hostname

let historic_data = false

// Get new statistics data
watch(statistics_data.json, async (newData) => {
    let labels = []
    let datasets = []
    let background_colors = []

    if (!historic_data) {
        let data = await get_historic_chart_data()
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

        let actual_day_value =  Object.values(profit_week)[Object.values(profit_week).length - 1]

        datasets.splice(datasets.length - 1, 1, actual_day_value)
        

        chart_data.value = {
            labels: labels,
            datasets: [{ data: datasets, backgroundColor: background_colors, borderRadius: 5 }]
        }
    }

}, { immediate: true })

async function get_historic_chart_data() {
    let labels = []
    let datasets = []
    let background_colors = []

    historic_chart_data  = await fetch(`http://${hostname}:${api_port}/profit/statistics`).then((response) =>
            response.json()
        )
    
}

function chart_classes(data: any) {
    if (Math.sign(data) >= 0) {
        return 'rgb(99, 226, 183)'
    } else {
        return 'rgb(99, 226, 183)'
    }
}

const chart_options = {
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
