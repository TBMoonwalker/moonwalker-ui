<template>
    <n-flex vertical>
        <n-h2>Daily profit</n-h2>
        <Bar
            id="my-chart-id"
            :options="chart_options"
            :data="chart_data"
        />
    </n-flex>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWebSocketDataStore } from '../stores/websocket'
import { storeToRefs } from 'pinia'

const statistics_store = useWebSocketDataStore("statistics")
const statistics_data = storeToRefs(statistics_store)
const chart_data  = ref()
chart_data.value = {
    labels: [],
    datasets: [{ }]
}

import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(BarElement, Tooltip, CategoryScale, LinearScale)

// Get new statistics data
watch(statistics_data.json, async (newData) => {
    let labels = []
    let datasets = []
    let background_colors = []

    if (newData !== undefined) {
        const websocket_data = JSON.parse(newData)
        for (let key in websocket_data.profit_week) {
            let value = websocket_data.profit_week[key]
            labels.push(key)
            datasets.push(value)
            background_colors.push(chart_classes(value))
        }
        // Show actual UPNL
        datasets[datasets.length-1] = datasets[datasets.length-1] + websocket_data.upnl
        background_colors[background_colors.length-1] = (chart_classes(datasets[datasets.length-1]))

        chart_data.value = {
            labels: labels,
            datasets: [{ data: datasets, backgroundColor: background_colors, borderRadius: 2 }]
        }
    }

}, { immediate: true })

function chart_classes(data: any) {
    if (Math.sign(data) >= 0) {
        return 'green'
    } else {
        return 'red'
    }
}

const chart_options = {
    responsive: true
}

</script>
