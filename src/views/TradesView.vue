<script setup lang="ts">
import OpenTrades from '../components/OpenTrades.vue'
import ClosedTrades from '../components/ClosedTrades.vue'
import Statistics from '@/components/Statistics.vue';
import Charts from '@/components/Charts.vue';

</script>

<template>
    <n-flex vertical>
        <Statistics />
        <Charts />
        <OpenTrades />
        <ClosedTrades />
    </n-flex>
</template>
