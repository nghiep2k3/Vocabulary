import React from 'react'
import styles from './Header.module.css'
import { SettingOutlined } from '@ant-design/icons';

export default function Header() {
  return (
    <div className={styles.header}>
      <div>
        <button className={styles.addWord}>Thêm từ mới</button>
      </div>
      <div className={styles.banner}>Từ vựng</div>
      <div className={styles.setting}><SettingOutlined style={{ fontSize: '30px', color: 'white' }}/></div>
    </div>
  )
}
