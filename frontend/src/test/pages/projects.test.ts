import { describe, expect, it } from 'vitest'
import { projects } from '@/features/Works/projects'

describe('公开实验清单', () => {
  it('只暴露三个已准备展示的实验', () => {
    expect(projects.map((project) => project.slug)).toEqual(['galaxy', 'waves', 'scroll'])
  })

  it('为每个实验提供稳定路由和静态海报', () => {
    for (const project of projects) {
      expect(project.href).toBe(`/works/${project.slug}`)
      expect(project.posterSrc).toBe(`/works/${project.slug}.webp`)
      expect(project.technologies.length).toBeGreaterThan(0)
      expect(project.focus.length).toBeGreaterThan(0)
      expect(project.scale.length).toBeGreaterThan(0)
      expect(project.constraint.length).toBeGreaterThan(0)
      expect(project.nextIteration.length).toBeGreaterThan(0)
    }
  })
})
