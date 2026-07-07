'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminStats } from '@/hooks/useAcademicCrud'
import {
  Building2,
  GraduationCap,
  Layers,
  BookOpen,
  Users,
  ClipboardList,
  Network,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '../components/Avatar'
import { StatCard } from '../components/StatCard'
import { AnimatedGrid, AnimatedItem } from '../components/AnimatedGrid'

const ROLE_COLORS: Record<string, string> = {
  admin: '#f43f5e',
  profesor: '#3b82f6',
  alumno: '#10b981'
}

export function AdminDashboard() {
  const { stats, loading } = useAdminStats()
  const { user } = useAuth()

  const val = (n: number) => (loading ? 0 : n)

  const roleData = [
    { name: 'Admin', value: stats.usersByRole.admin ?? 0 },
    { name: 'Profesores', value: stats.usersByRole.profesor ?? 0 },
    { name: 'Alumnos', value: stats.usersByRole.alumno ?? 0 }
  ].filter((d) => d.value > 0)

  const compositionData = [
    { name: 'Niveles', value: stats.levels, fill: '#3b82f6' },
    { name: 'Materias', value: stats.subjects, fill: '#a855f7' },
    { name: 'Paralelos', value: stats.classGroups, fill: '#10b981' },
    { name: 'Asignaciones', value: stats.teachingAssignments, fill: '#f59e0b' }
  ]

  const firstName = user?.name?.split(' ')[0] ?? ''

  const quickLinks = [
    { href: '/lms/admin/institutions', label: 'Instituciones', icon: Building2 },
    { href: '/lms/admin/levels', label: 'Niveles', icon: Layers },
    { href: '/lms/admin/subjects', label: 'Materias', icon: BookOpen },
    { href: '/lms/admin/class-groups', label: 'Paralelos', icon: Network },
    {
      href: '/lms/admin/students',
      label: 'Estudiantes',
      icon: GraduationCap
    },
    {
      href: '/lms/admin/enrollments',
      label: 'Matrículas',
      icon: GraduationCap
    },
    {
      href: '/lms/admin/teaching-assignments',
      label: 'Asignaciones',
      icon: ClipboardList
    }
  ]

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center gap-4'
      >
        <Avatar name={user?.name ?? ''} size='lg' />
        <div>
          <h1 className='text-2xl font-bold text-foreground font-serif tracking-tight'>Panel general</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            Vista global de la plataforma académica
          </p>
        </div>
      </motion.div>

      <AnimatedGrid className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <AnimatedItem>
          <StatCard
            icon={Building2}
            label='Instituciones'
            value={val(stats.institutions)}
            tone='primary'
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard icon={Layers} label='Niveles' value={val(stats.levels)} tone='info' />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon={BookOpen}
            label='Materias'
            value={val(stats.subjects)}
            tone='success'
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon={Network}
            label='Paralelos'
            value={val(stats.classGroups)}
            tone='warning'
          />
        </AnimatedItem>
      </AnimatedGrid>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Barras: usuarios por rol */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Users className='w-5 h-5 text-primary' />
              Usuarios por rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className='text-muted-foreground text-sm'>Cargando...</p>
            ) : (
              <ResponsiveContainer width='100%' height={240}>
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='name' fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <RTooltip />
                  <Bar dataKey='value' radius={[6, 6, 0, 0]}>
                    {roleData.map((d) => {
                      const key =
                        d.name === 'Admin'
                          ? 'admin'
                          : d.name === 'Profesores'
                            ? 'profesor'
                            : 'alumno'
                      return <Cell key={d.name} fill={ROLE_COLORS[key]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Dona: composición académica */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Layers className='w-5 h-5 text-primary' />
              Composición académica
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className='text-muted-foreground text-sm'>Cargando...</p>
            ) : (
              <ResponsiveContainer width='100%' height={240}>
                <PieChart>
                  <Pie
                    data={compositionData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {compositionData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend iconType='circle' wrapperStyle={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Gestión académica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className='flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/40 transition-colors group'
              >
                <span className='flex items-center gap-3 text-sm font-medium text-foreground'>
                  <q.icon className='w-4 h-4 text-primary' />
                  {q.label}
                </span>
                <ArrowRight className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors' />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
