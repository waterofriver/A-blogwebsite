"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Play } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const RESOURCES_API_BASE =
  (process.env.NEXT_PUBLIC_RESOURCES_API && process.env.NEXT_PUBLIC_RESOURCES_API.replace(/\/$/, "")) ||
  "http://127.0.0.1:8000/api/resources"
const HANDBOOK_LINK = "https://note.youdao.com/s/3EprlwzR"

type CatalogAttachment = {
  id: string
  category: string
  category_display: string
  category_order?: number
  item_name?: string
  item_label?: string
  label: string
  filename: string
  file_type: string
  media_url?: string
  preview_url?: string
  download_url?: string
  html_preview_url?: string | null
  orig_name?: string
  supports_inline_preview?: boolean
}

type ExperimentBucket = {
  category: string
  category_display: string
  order: number
  items: CatalogAttachment[]
  files_count?: number
}

type MaterialsCatalog = {
  updated_at: string | null
  synced_to: { order: number | null; label: string | null } | null
  experiments: ExperimentBucket[]
  videos: CatalogAttachment[]
  books: CatalogAttachment[]
  handbook_download_url?: string | null
}

export function ResourcesSection() {
  const [materialsCatalog, setMaterialsCatalog] = useState<MaterialsCatalog | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [previewResource, setPreviewResource] = useState<CatalogAttachment | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentBucket | null>(null)
  const [rebuildLoading, setRebuildLoading] = useState(false)
  const [rebuildMessage, setRebuildMessage] = useState<string | null>(null)

  const loadCatalog = useCallback(() => {
    setCatalogError(null)
    setCatalogLoading(true)
    fetch(`${RESOURCES_API_BASE}/catalog/`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: MaterialsCatalog) => {
        setMaterialsCatalog(data)
      })
      .catch((err) => {
        console.error("加载实验资源失败", err)
        setCatalogError("资源数据加载失败，请稍后重试")
      })
      .finally(() => setCatalogLoading(false))
  }, [])

  useEffect(() => {
    loadCatalog()
  }, [loadCatalog])

  const triggerRebuild = useCallback(async () => {
    setRebuildMessage(null)
    setRebuildLoading(true)
    try {
      const res = await fetch(`${RESOURCES_API_BASE}/rebuild/`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("同步失败")
      }
      await res.json().catch(() => ({}))
      setRebuildMessage("同步完成")
      await loadCatalog()
    } catch (_err) {
      setRebuildMessage("同步失败")
    } finally {
      setRebuildLoading(false)
    }
  }, [loadCatalog])

  const experimentBuckets = materialsCatalog?.experiments || []
  const videoList = materialsCatalog?.videos || []
  const bookList = materialsCatalog?.books || []
  const formattedUpdatedAt = materialsCatalog?.updated_at
    ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(materialsCatalog.updated_at),
      )
    : null
  const handbookDownloadUrl = materialsCatalog?.handbook_download_url || null

  const openPreview = useCallback((item: CatalogAttachment | null) => {
    if (!item) return
    setPreviewResource(item)
    if (item.html_preview_url) {
      setPreviewLoading(true)
      fetch(item.html_preview_url)
        .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
        .then((data) => {
          setPreviewHtml(data.html || "<p>暂无内容</p>")
        })
        .catch(() => setPreviewHtml("<p>预览失败，请下载查看</p>"))
        .finally(() => setPreviewLoading(false))
    } else {
      setPreviewHtml(null)
      setPreviewLoading(false)
    }
  }, [])

  const getPreviewSrc = useCallback((item: CatalogAttachment | null) => {
    if (!item) return null
    return item.preview_url || item.media_url || null
  }, [])

  const isVideoResource = (item: CatalogAttachment | null) => {
    if (!item) return false
    return ["mp4", "mov", "avi", "wmv", "mkv"].includes(item.file_type)
  }

  return (
    <div className="space-y-8">
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 p-8 text-white shadow-xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <Badge className="rounded-2xl bg-white/20 text-white">资源矩阵</Badge>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Labs · Docs · Videos</p>
                <h2 className="mt-2 text-3xl font-bold md:text-4xl">实验全流程手册</h2>
              </div>
              <p className="max-w-[560px] text-white/85">更新至实验一至实验七。</p>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-2xl bg-white text-rose-600 hover:bg-white/90" asChild>
                  <Link href={HANDBOOK_LINK} target="_blank">
                    查看云端手册
                  </Link>
                </Button>
                {handbookDownloadUrl && (
                  <Button className="rounded-2xl bg-white/90 text-rose-700 hover:bg-white" asChild>
                    <Link href={handbookDownloadUrl} target="_blank">
                      下载手册
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-3xl bg-white/15 p-6 text-right backdrop-blur space-y-3">
              <div>
                <p className="text-sm text-white/70">最近同步</p>
                <p className="text-2xl font-semibold">{formattedUpdatedAt || "加载中"}</p>
              </div>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-2xl bg-white/80 text-rose-700 hover:bg-white"
                  onClick={triggerRebuild}
                  disabled={rebuildLoading}
                >
                  {rebuildLoading ? "同步中..." : "资源更新"}
                </Button>
                {rebuildMessage && <p className="text-xs text-white/80">{rebuildMessage}</p>}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {catalogError && (
        <Card className="rounded-3xl border-red-200 bg-red-50 text-red-700 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <span>{catalogError}</span>
            <Button size="sm" className="rounded-2xl" onClick={loadCatalog}>
              重新加载
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">精选实验视频</h2>
        </div>
        {catalogLoading && videoList.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((skeleton) => (
              <Card key={skeleton} className="rounded-3xl animate-pulse bg-muted/40 h-48" />
            ))}
          </div>
        ) : videoList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videoList.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary"
                onClick={() => openPreview(video)}
              >
                <CardHeader className="pb-2 p-4 rounded-t-3xl bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{video.label}</CardTitle>
                    <Badge className="rounded-xl bg-white/20 text-white/95">{video.category_display}</Badge>
                  </div>
                  <CardDescription className="text-white/90">点击播放 / 支持在线预览</CardDescription>
                </CardHeader>
                <CardContent className="p-4 rounded-b-3xl bg-gradient-to-t from-teal-700/10 via-emerald-600/10 to-teal-600/10">
                  <div className="relative">
                    <video
                      className="aspect-video w-full rounded-2xl object-cover"
                      src={video.preview_url || video.media_url}
                      preload="metadata"
                      muted
                      playsInline
                      onLoadedData={(e) => {
                        const v = e.currentTarget
                        try {
                          const targetTime = Math.min(0.1, Math.max(0.05, (v.duration || 1) * 0.01))
                          v.currentTime = targetTime
                          v.pause()
                        } catch (err) {
                          // ignore seek failures; still show whatever is available
                        }
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 text-sm text-white shadow-md">
                      <Play className="mr-2 h-4 w-4 text-white" /> 实验视频
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-3xl bg-white shadow-sm">
            <CardContent className="p-6 text-center text-muted-foreground">
              暂无视频，可在 upload/materials 中新增 mp4 后自动出现。
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">课程实验</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {experimentBuckets.map((bucket, idx) => (
            <Card
              key={bucket.category}
              className="rounded-3xl border-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/60 text-white shadow-lg cursor-pointer transition hover:-translate-y-1"
              onClick={() => setSelectedExperiment(bucket)}
            >
              <CardHeader className="pb-2 text-white">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-xl bg-white/20 text-white">{bucket.order === 0 ? "先导" : `实验 ${bucket.order}`}</Badge>
                  <span className="text-xs text-white/70">{bucket.files_count || 0} 个文件</span>
                </div>
                <CardTitle className="mt-2">{bucket.category_display}</CardTitle>
                <CardDescription className="text-white/80">点击展开查看压缩包 / 讲义 / 视频</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={((idx + 1) / (experimentBuckets.length || 1)) * 100} className="h-2 rounded-xl bg-white/20" />
                <p className="mt-2 text-xs text-white/70">自动整理自材料库</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">推荐书籍</h2>
        </div>
        {catalogLoading && bookList.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((skeleton) => (
              <Card key={skeleton} className="rounded-3xl animate-pulse bg-muted/40 h-40" />
            ))}
          </div>
        ) : bookList.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {bookList.map((book) => {
              const previewHref = book.preview_url || book.media_url
              const downloadHref = book.download_url
              return (
                <Card key={book.id} className="rounded-3xl flex flex-col border-0 bg-gradient-to-br from-amber-500/80 via-orange-500/70 to-rose-500/70 text-white shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle>{book.label}</CardTitle>
                    <CardDescription className="text-white/80">{book.category_display || book.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-white/80">
                    文件类型：{book.file_type?.toUpperCase() || "未知"}
                  </CardContent>
                  <CardFooter className="mt-auto gap-2">
                    {previewHref ? (
                      <Button size="sm" className="rounded-2xl flex-1 bg-white text-amber-600 hover:bg-white/90" onClick={() => openPreview(book)}>
                        预览
                      </Button>
                    ) : (
                      <Button size="sm" className="rounded-2xl flex-1" disabled>
                        预览
                      </Button>
                    )}
                    {downloadHref ? (
                      <Button
                        asChild
                        size="sm"
                        className="rounded-2xl flex-1 bg-black/30 text-white hover:bg-black/40"
                      >
                        <Link href={downloadHref} target="_blank">
                          下载
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" className="rounded-2xl flex-1 opacity-60" disabled>
                        下载
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="rounded-3xl bg-white shadow-sm">
            <CardContent className="p-6 text-center text-muted-foreground">
              暂无参考书籍，可刷新重新加载。
            </CardContent>
          </Card>
        )}
      </section>

      <Dialog
        open={!!previewResource}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewResource(null)
            setPreviewHtml(null)
            setPreviewLoading(false)
          }
        }}
      >
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>{previewResource?.label}</DialogTitle>
            <DialogDescription>{previewResource?.category_display}</DialogDescription>
          </DialogHeader>
          {(() => {
            if (previewResource?.html_preview_url) {
              if (previewLoading) {
                return <p className="text-sm text-muted-foreground">预览生成中...</p>
              }
              return (
                <div
                  className="max-h-[70vh] overflow-y-auto rounded-2xl border bg-white p-6"
                  dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-center text-muted-foreground">暂无内容</p>' }}
                />
              )
            }
            const src = getPreviewSrc(previewResource)
            if (!src) {
              return <p className="text-sm text-muted-foreground">暂无法预览此文件，可尝试下载查看。</p>
            }
            if (isVideoResource(previewResource)) {
              return (
                <video
                  controls
                  className="w-full rounded-2xl bg-black"
                  src={src}
                  preload="auto"
                  playsInline
                />
              )
            }
            return (
              <iframe
                src={src}
                className="h-[70vh] w-full rounded-2xl border bg-white"
                title={previewResource?.label}
              />
            )
          })()}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPreviewResource(null)} className="rounded-2xl">
              关闭
            </Button>
            {previewResource?.download_url && (
              <Button asChild className="rounded-2xl">
                <Link href={previewResource.download_url} target="_blank">
                  下载文件
                </Link>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedExperiment} onOpenChange={(open) => !open && setSelectedExperiment(null)}>
        <SheetContent side="right" className="w-full max-w-xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle>{selectedExperiment?.category_display}</SheetTitle>
            <SheetDescription>
              {selectedExperiment?.files_count ? `共 ${selectedExperiment.files_count} 个资源` : "自动聚合的实验资料"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedExperiment?.items?.length ? (
              selectedExperiment.items.map((item) => {
                const previewHref = item.preview_url || item.media_url
                const downloadHref = item.download_url
                return (
                  <Card key={item.id} className="rounded-2xl bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.label}</CardTitle>
                      <CardDescription>
                        {(item.item_label && `${item.item_label} · `) || ""}
                        {item.file_type?.toUpperCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="gap-2">
                      {previewHref ? (
                        <Button size="sm" className="rounded-2xl flex-1" onClick={() => openPreview(item)}>
                          预览
                        </Button>
                      ) : (
                        <Button size="sm" className="rounded-2xl flex-1" disabled>
                          预览
                        </Button>
                      )}
                      {downloadHref ? (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-2xl flex-1 bg-primary text-white hover:bg-primary/90"
                        >
                          <Link href={downloadHref} target="_blank">
                            下载
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" className="rounded-2xl flex-1" disabled>
                          下载
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">该实验暂时没有资源。</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
