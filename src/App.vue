<script setup lang="ts">
import { MOONWALKER_API_PORT } from './config'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import { useOsTheme, darkTheme } from 'naive-ui'
import { computed, watch } from 'vue'
import { useWebSocketDataStore } from './stores/websocket'
import { useWebSocket } from '@vueuse/core'

const osThemeRef = useOsTheme()
const theme = computed(() => (osThemeRef.value === 'dark' ? darkTheme : null))

// Stores
const open_trade_store = useWebSocketDataStore("openTrades")
const closed_trade_store = useWebSocketDataStore("closedTrades")
const statistics_store = useWebSocketDataStore("statistics")
const websocket_port = MOONWALKER_API_PORT
const hostname = window.location.hostname

const closed_orders = useWebSocket('ws://' + hostname + ':' + websocket_port + '/trades/closed', {
  autoReconnect: true,
})

const open_orders = useWebSocket('ws://' + hostname + ':' + websocket_port + '/trades/open', {
  autoReconnect: true,
})

const statistics = useWebSocket('ws://' + hostname + ':' + websocket_port + '/statistic/profit', {
  autoReconnect: true,
})

// Watch Stores
watch(open_orders.data, async (newData) => {
  open_trade_store.json = newData
})

watch(closed_orders.data, async (newData) => {
  closed_trade_store.json = newData
})

watch(statistics.data, async (newData) => {
  statistics_store.json = newData
})

// API Call Methods


</script>

<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <n-notification-provider>
        <n-modal-provider>
          <n-dialog-provider>
            <n-flex justify="center">
              <Header />
            </n-flex>
            <n-flex justify="center">
              <RouterView />
            </n-flex>
          </n-dialog-provider>
        </n-modal-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>