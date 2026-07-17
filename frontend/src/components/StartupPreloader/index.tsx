import { useStartupPreload } from '@/providers/startupPreloadContext'
import './index.scss'

const phaseText = {
  loading: '正在载入首页资源',
  complete: '资源准备完成',
  error: '部分资源未能载入',
  skipped: '',
} as const

export default function StartupPreloader() {
  const { visible, phase, progress, loaded, total, currentAsset, failures, retry, skip } =
    useStartupPreload()

  if (!visible) {
    return null
  }

  const hasFailure = phase === 'error'

  return (
    <div
      aria-busy={phase === 'loading'}
      className={`startup-preloader startup-preloader--${phase}`}
    >
      <section aria-live="polite" className="startup-preloader__panel" role="status">
        <p className="startup-preloader__eyebrow">Lynco Hub / Initializing</p>
        <h1>{phaseText[phase]}</h1>
        <p className="startup-preloader__asset">{currentAsset}</p>

        <div
          aria-label="首页资源加载进度"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="startup-preloader__progress"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="startup-preloader__count">
          {progress}% {total > 0 && `· ${loaded} / ${total}`}
        </p>

        {hasFailure && (
          <div className="startup-preloader__failure" role="alert">
            <p>以下资源暂时不可用：</p>
            <ul>
              {failures.map(({ asset }) => (
                <li key={asset.id}>{asset.label}</li>
              ))}
            </ul>
            <div className="startup-preloader__actions">
              <button type="button" onClick={retry}>
                重试
              </button>
              <button type="button" onClick={skip}>
                跳过进入
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
