<script setup>
/*global  dysonUseKeplr dysonVueStore */
import { onMounted } from "vue"

import { RouterLink, RouterView } from "vue-router"

import { useDark, useToggle } from "@vueuse/core"

const isDark = useDark({
  selector: "html",
  attribute: "data-theme",
  valueDark: "dark",
  valueLight: "light",
  disableTransition: false,
})
const toggleDark = useToggle(isDark)

import { ref, computed } from "vue"
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from "@headlessui/vue"
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  QueueListIcon,
  ArrowsRightLeftIcon,
  PlusCircleIcon,
} from "@heroicons/vue/24/outline"

const navigation = [
  { name: "Swap", to: { name: "home" }, icon: ArrowsRightLeftIcon },
  { name: "Pools", to: { name: "pool-list" }, icon: QueueListIcon },
  { name: "Create Pool", to: { name: "create-pool" }, icon: PlusCircleIcon },
  //{ name: "Team", href: "#", icon: UsersIcon, current: false },
  //{ name: "Projects", href: "#", icon: FolderIcon, current: false },
  //{ name: "Calendar", href: "#", icon: CalendarIcon, current: false },
  //{ name: "Documents", href: "#", icon: DocumentDuplicateIcon, current: false },
  //{ name: "Reports", href: "#", icon: ChartPieIcon, current: false },
]
const links = [
  { name: "Twitter", href: "https://twitter.com/whaleswap_dys", initial: "T" },
  {
    name: "Dys Script",
    href: "https://dys.dysonprotocol.com/scripts/whaleswap.dys",
    initial: "D",
  },
  {
    name: "GitHub",
    href: "https://github.com/sybilsingleton/whaleswap.dys",
    initial: "G",
  },
]

const sidebarOpen = ref(false)
let account = ref(null)

const keplrAvailable = computed(() => !!window.keplr)

async function accountChanged(newAccount) {
  account.value = newAccount
}

async function connectWallet() {
  try {
    await dysonUseKeplr(accountChanged)
  } catch (e) {
    this.keplrError = e
  }
}
</script>

<template>
  <div>
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-neutral-focus opacity-50" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1 bg-base-200">
              <TransitionChild
                as="template"
                enter="ease-in-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in-out duration-300"
                leave-from="opacity-100"
                leave-to="opacity-0"
              >
                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="h-6 w-6 text-base-content" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <!-- Sidebar component, swap this element with another sidebar if you like -->
              <div
                class="flex-grow flex flex-col gap-y-5 overflow-y-auto border-r border-base-300 px-6"
              >
                <div class="h-16 flex items-center font-semibold leading-6 text-base-content">
                  WhaleSwap.dys
                </div>

                <nav class="flex flex-1 flex-col gap-y-7">
                  <ul role="list">
                    <li v-for="item in navigation" :key="item.name">
                      <RouterLink
                        :to="item.to"
                        class="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-base-content"
                      >
                        <component
                          :is="item.icon"
                          class="h-6 w-6 shrink-0 text-base-content group-hover:text-primary"
                          aria-hidden="true"
                        />
                        {{ item.name }}
                      </RouterLink>
                    </li>
                  </ul>
                  <div>
                    <div class="text-xs font-semibold leading-6 text-base-content">
                      Official Links
                    </div>
                    <ul role="list" class="mt-2">
                      <li v-for="item in links" :key="item.name">
                        <a
                          :href="item.href"
                          class="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-base-content"
                          target="_blank"
                        >
                          <span
                            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-base-100"
                            >{{ item.initial }}</span
                          >
                          {{ item.name }}
                        </a>
                      </li>
                    </ul>
                  </div>

                  <input
                    class="toggle m-2"
                    type="checkbox"
                    @click="toggleDark()"
                    :checked="!isDark"
                  />
                  <button
                    v-if="keplrAvailable && !account"
                    @click="connectWallet"
                    class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 -mx-6 mt-auto bg-primary hover:bg-primary-focus text-primary-content"
                  >
                    Connect to Keplr
                  </button>
                  <div
                    v-else
                    class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 -mx-6 mt-auto"
                  >
                    Wallet: {{ account.name }}
                  </div>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 w-72 bg-base-200">
      <!-- Sidebar component -->
      <div class="flex-grow flex flex-col gap-y-5 overflow-y-auto border-r border-base-300 px-6">
        <div class="h-16 flex items-center font-semibold leading-6 text-base-content">
          WhaleSwap.dys
        </div>

        <nav class="flex flex-1 flex-col gap-y-7">
          <ul role="list">
            <li v-for="item in navigation" :key="item.name">
              <RouterLink
                :to="item.to"
                class="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-base-content"
              >
                <component
                  :is="item.icon"
                  class="h-6 w-6 shrink-0 text-base-content group-hover:text-primary"
                  aria-hidden="true"
                />
                {{ item.name }}
              </RouterLink>
            </li>
          </ul>
          <div>
            <div class="text-xs font-semibold leading-6 text-base-content">Official Links</div>
            <ul role="list" class="mt-2">
              <li v-for="item in links" :key="item.name">
                <a
                  :href="item.href"
                  class="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-base-content"
                  target="_blank"
                >
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-base-100"
                    >{{ item.initial }}</span
                  >
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>

          <input class="toggle m-2" type="checkbox" @click="toggleDark()" :checked="!isDark" />
          <button
            v-if="keplrAvailable && !account"
            @click="connectWallet"
            class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 -mx-6 mt-auto bg-primary hover:bg-primary-focus text-primary-content"
          >
            Connect to Keplr
          </button>
          <div
            v-else
            class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 -mx-6 mt-auto"
          >
            Wallet: {{ account.name }}
          </div>
        </nav>
      </div>
    </div>

    <!-- Static top navbar for mobile -->
    <div
      class="sticky top-0 z-40 flex items-center gap-x-6 bg-base-200 px-4 py-4 shadow-sm sm:px-6 lg:hidden"
    >
      <button
        type="button"
        class="-m-2.5 p-2.5 text-base-content lg:hidden"
        @click="sidebarOpen = true"
      >
        <span class="sr-only">Open sidebar</span>
        <Bars3Icon class="h-6 w-6" aria-hidden="true" />
      </button>
      <div class="flex-1 font-semibold leading-6 text-base-content">WhaleSwap.dys</div>

      <button
        v-if="keplrAvailable && !account"
        @click="connectWallet"
        class="btn btn-primary btn-xs"
      >
        Connect to Keplr
      </button>
      <span v-if="account" class=""> Wallet: {{ account.name }} </span>
    </div>

    <RouterView :account="account" />
  </div>
</template>

<style scoped></style>
