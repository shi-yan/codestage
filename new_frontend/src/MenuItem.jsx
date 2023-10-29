import { createSignal } from 'solid-js'
import styles from './MenuItem.css'

function MenuItem() {
    function onSelect(e) { }
    return (
        <li class="menu-item clickable-item">
            <h3 class={item.folder ? 'clickable' : ''} onclick={onSelect}>
                {item.title}
            </h3>
            <Show when={item.sub_chapters && item.sub_chapters.length > 0}>
                <ul>
                    <For each={item.sub_chapters()}>
                        {(f, i) =>
                            <menu-item
                                key={item.title}
                                item={item}>
                            </menu-item>}
                    </For>
                </ul>
            </Show>
        </li >
    )
}

export default MenuItem
