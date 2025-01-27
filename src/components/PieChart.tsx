/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */
import { pluralise } from '@src/Helpers'
import * as d3 from 'd3'
import React, { useEffect } from 'react'

const PieChart = (props: {
    type: string
    postId: number
    totalVotes: number
    totalPoints: number
    totalUsers: number
    answers: any[]
}): JSX.Element => {
    const { type, postId, totalVotes, totalPoints, totalUsers, answers } = props
    const weighted = type === 'weighted-choice'
    const size = 280
    const padding = 100
    const arcWidth = 30
    const circleRadius = (size - padding) / 2
    const colorScale = d3
        .scaleSequential()
        .domain([0, answers.length])
        .interpolator(d3.interpolateViridis)

    useEffect(() => {
        const canvas = d3.select(`#pie-chart-${postId}`)
        // remove old chart if present
        d3.select(canvas.node()).select('svg').remove()
        // build new chart
        const arc = d3
            .arc()
            .outerRadius(circleRadius)
            .innerRadius(circleRadius - arcWidth)
        const pie = d3.pie().value((d) => {
            if (weighted) return d.totalPoints
            return d.totalVotes
        })

        const svg = d3
            .select(canvas.node())
            .append('svg')
            .attr('id', 'svg')
            .attr('width', size)
            .attr('height', size)
            .append('g')
            .attr('transform', `translate(${size / 2},${size / 2})`)

        const answerGroup = svg.selectAll().data(pie(answers)).enter().append('g')

        // create arcs
        answerGroup
            .append('path')
            .attr('d', arc)
            .style('fill', (d, i) => colorScale(i))
            .style('stroke', '#f7f7f9')
            .style('stroke-width', 2)
            .style('opacity', 0)
            .attr('transform', 'translate(0, 0) scale(0)')
            .transition()
            .duration(1000)
            .attr('transform', 'translate(0, 0) scale(1)')
            .style('opacity', 1)
            .attrTween('d', (d) => {
                const originalEnd = d.endAngle
                return (t) => {
                    const currentAngle = d3.interpolate(pie.startAngle()(), pie.endAngle()())(t)
                    if (currentAngle < d.startAngle) {
                        return ''
                    }
                    d.endAngle = Math.min(currentAngle, originalEnd)
                    return arc(d)
                }
            })

        if (!totalVotes) {
            svg.append('path')
                .datum({ startAngle: 0, endAngle: 2 * Math.PI })
                .attr('d', arc)
                .style('fill', '#ddd')
                .style('stroke', 'white')
                .style('stroke-width', 2)
                .style('opacity', 0)
                .attr('transform', 'translate(0, 0) scale(0)')
                .transition()
                .duration(1000)
                .attr('transform', 'translate(0, 0) scale(1)')
                .style('opacity', 1)
        }

        // total votes / points
        answerGroup
            .append('text')
            .attr('transform', (d) => {
                const centroid = arc.centroid(d)
                centroid[0] *= 1.5
                centroid[1] = centroid[1] * 1.5 - 10
                return `translate(${centroid})`
            })
            .attr('dy', 5)
            .attr('font-size', 14)
            .style('font-weight', 800)
            .style('text-anchor', 'middle')
            .style('opacity', 0)
            .transition()
            .duration(2000)
            .style('opacity', 1)
            .text((d) => {
                if (weighted) return d.data.totalPoints ? `${d.data.totalPoints / 100} ↑` : ''
                return d.data.totalVotes ? `${d.data.totalVotes} ↑` : '' // ↑⇧⇑⇪⬆
            })

        // percentage of votes / points
        answerGroup
            .append('text')
            .attr('class', 'percentage')
            .attr('font-size', 12)
            .attr('transform', (d) => {
                const centroid = arc.centroid(d)
                centroid[0] *= 1.5
                centroid[1] = centroid[1] * 1.5 + 10
                return `translate(${centroid})`
            })
            .attr('dy', '.50em')
            .style('text-anchor', 'middle')
            .style('opacity', 0)
            .transition()
            .duration(2000)
            .style('opacity', 1)
            .text((d) => {
                if (weighted)
                    return totalPoints && d.data.totalPoints
                        ? `${+((d.data.totalPoints / totalPoints) * 100).toFixed(1)}%`
                        : ''
                return totalVotes && d.data.totalVotes
                    ? `${+((d.data.totalVotes / totalVotes) * 100).toFixed(1)}%`
                    : ''
            })

        // arc index
        answerGroup
            .append('text')
            .attr('transform', (d) => `translate(${arc.centroid(d)})`)
            .attr('dy', 5)
            .style('text-anchor', 'middle')
            .style('fill', 'white')
            .style('opacity', 0)
            .transition()
            .duration(2000)
            .style('opacity', 1)
            .text((d, i) => {
                if (+((d.data.totalVotes / totalVotes) * 100).toFixed(2) < 4) {
                    return ''
                }
                return `${i + 1}`
            })

        // total text
        d3.select(canvas.node())
            .select('#svg')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', 36)
            .attr('x', size / 2)
            .attr('y', size / 2)
            .text(weighted ? totalUsers : totalVotes.toFixed(0))
            .style('opacity', 0)
            .transition()
            .duration(2000)
            .style('opacity', 1)

        // votes text
        d3.select(canvas.node())
            .select('#svg')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', 18)
            .attr('x', size / 2)
            .attr('y', size / 2 + 25)
            .text(`vote${pluralise(weighted ? +totalUsers : +totalVotes.toFixed(0))}`)
            .style('opacity', 0)
            .transition()
            .duration(2000)
            .style('opacity', 1)
    }, [answers])

    return <div id={`pie-chart-${postId}`} />
}

export default PieChart
