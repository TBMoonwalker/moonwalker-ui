<template>
    <n-grid :cols="3">
        <n-gi>
            <n-statistic id="profit_overall" :class="profit_class" label="Profit overall" :value="profit_overall" />
        </n-gi>
        <n-gi>
            <n-statistic id="upnl" :class="upnl_class" label="UPNL" :value="upnl" />
        </n-gi>
        <n-gi>
            <n-statistic label="Funds locked" :value="funds_locked" />
        </n-gi>
    </n-grid>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWebSocketDataStore } from '../stores/websocket'
import { storeToRefs } from 'pinia'

const statistics_store = useWebSocketDataStore("statistics")
const statistics_data = storeToRefs(statistics_store)
const profit_overall = ref()
const profit_class = ref()
const upnl = ref()
const upnl_class = ref()
const funds_locked = ref()

// Get new statistics data
watch(statistics_data.json, async (newData) => {
    if (newData !== undefined) {
        const websocket_data = JSON.parse(newData)
        upnl.value = websocket_data.upnl.toFixed(2)
        upnl_class.value = row_classes(upnl.value)
        profit_overall.value = websocket_data.profit_overall.toFixed(2)
        profit_class.value = row_classes(profit_overall.value)
        funds_locked.value = websocket_data.funds_locked
    }

}, { immediate: true })

function row_classes(data) {
    if (Math.sign(data) >= 0) {
        return 'green'
    } else {
        return 'red'
    }
}

</script>

<style scoped>
:deep(#profit_overall.n-statistic.red) {
  --n-value-text-color: rgba(255, 0, 0, 0.75) !important;
}

:deep(#profit_overall.n-statistic.green) {
    --n-value-text-color: rgb(0, 255, 0) !important;
}

:deep(#upnl.n-statistic.red) {
  --n-value-text-color: rgba(255, 0, 0, 0.75) !important;
}

:deep(#upnl.n-statistic.green) {
    --n-value-text-color: rgb(0, 255, 0) !important;
}
</style>


