import { createSignal } from 'solid-js'
import styles from './MenuItem.module.css'

function MenuItem(props) {
    function onSelect(e) { }
    return (
        <li class={`${styles.MenuItem} ${styles.ClickableItem}`} >
            <h3 classList={{ clickable: props.item.folder }} onclick={onSelect}>
                {props.item.title}
            </h3>
            <Show when={props.item.sub_chapters && props.item.sub_chapters.length > 0}>
                <ul>
                    <For each={props.item.sub_chapters}>
                        {(item, i) =>
                            <MenuItem
                                key={item.title}
                                item={item}>
                            </MenuItem>}
                    </For>
                </ul>
            </Show>
        </li >
    )
}

export default MenuItem
